/* global global, GLOBAL, module */
/**
 * Created by kaelyang on 2015/5/19.
 */
var http = require('http');

var log4js = require('log4js');
var logger = log4js.getLogger();
var _ = require('underscore');
var UserService = require('./UserService');
var StatisticsService = require('./StatisticsService');
var Exporting = require('node-highcharts-exporting');
var path = require("path");
var fs  = require("fs");

var send_email = require("../utils/" + GLOBAL.pjconfig.email.module);
var dateFormat = require("../utils/dateFormat");

var EmailService = function() {
    this.userService = new UserService();
    this.statisticsService = new StatisticsService();
    this.top = parseInt(GLOBAL.pjconfig.email.top, 10) || 20;
    this.from = GLOBAL.pjconfig.email.from || "noreply-badjs@tencent.com";
    this.homepage = GLOBAL.pjconfig.email.homepage;
};

var getYesterday = function() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return date;
};


var setChartX =  function (number){
    var days = [];
    var nowDay = new Date()-0;

    for(var i = number;i>0; i--){
        var day = nowDay - i*1000*60*60*24;
        days.push(dateFormat(new Date(day), 'MM-dd'));
    }
    return days;
}

var getImageData = function (name  , data){

    var totalArray = [0,0,0,0,0,0,0];
    var categories = setChartX(7);

    function whichDayIndex(day1){
        for(var i =0,len = categories.length; i<len; i++){
            if(day1 == categories[i]){
                return i;
            }
        }
        return false;
    }

    _.forEach(data , function (value ,key){
        var index = whichDayIndex( dateFormat(new Date(value.startDate), 'MM-dd'));
        totalArray[index] = value.total
    });


    return {
        data: {
            xAxis: {
                categories: categories
            },
            series: [
                {
                    data: totalArray,
                    name :"-"
                }
            ]
        },

        options : {
            title : {text : "The last 7 days line charts"} ,
            "yAxis" : {"title" : {"text": "total" }}
        },


        width : 800

    }
}

var encodeHtml = function (str) {
    return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\x60/g, '&#96;').replace(/\x27/g, '&#39;').replace(/\x22/g, '&quot;');
};


EmailService.prototype = {
    render: function(data ,imagePath) {
        var that = this;
        data = data || {};
        var html = [];
        html.push('<html>');
        html.push('<h3>【BadJS日报邮件】 ' + data.title + '</h3>');
        that.homepage && html.push('<p style="font-size:12px"><a href="{{homepage}}">日志查看点这: {{homepage}}</a></p>'.replace(/{{homepage}}/g, that.homepage));
        var content = data.content;
        if (content && content.length) {
            html.push('<table style="border-collapse:collapse;;width:95%"><tr style="background-color:#188eee;text-align:left;color:#fff"><th style="padding:2px 0 2px 10px;border:1px solid #dedede;width:60px">#</th><th style="padding:2px 0 2px 10px;border:1px solid #dedede;;width:120px">出现次数</th><th style="padding:2px 0 2px 10px;border:1px solid #dedede">错误内容</th></tr>');
            var total_top = 0;
            content.forEach(function(v, i) {
                v = typeof v === 'object' ? v : null;
                if (v) {
                    html.push('<tr style="background-color:{{bgc}}"><td style="padding:2px 0 2px 10px;border:1px solid #dedede">{{index}}</td><td style="padding:2px 0 2px 10px;border:1px solid #dedede">{{times}}</td><td style="padding:2px 0 2px 10px;border:1px solid #dedede">{{desc}}</td></tr>'
                        .replace(/{{index}}/g, i + 1)
                        .replace(/{{times}}/g, v.total)
                        .replace(/{{desc}}/g,encodeHtml( v.title))
                        .replace(/{{bgc}}/g, i % 2 ? '#fff' : '#eee')
                    );
                    total_top += v.total;
                }
            });
            html.push('</table>');
            var total = data.total;
            total > 0 && html.push('<p style="border-top:1px solid #666;margin-top:20px;width:520px;padding:5px 0 0 10px">共 {{total}} 条记录, Top {{top}} 占 {{per}}.</p>'
                .replace(/{{total}}/g, total)
                .replace(/{{top}}/g, that.top)
                .replace(/{{per}}/g, (total_top * 100 / total).toFixed(2) + '%')
            );

            if(imagePath){
                html.push("<p>&nbsp;</p>")
                html.push("<p>&nbsp;</p>")
                html.push('<h4>最近7天图表统计</h4>')
                html.push('<p><img src="http://badjs.server.com/'+imagePath+'"></p>');
            }

        } else {
            html.push('<p style="border-top:1px solid #666;margin-top:20px;width:520px;padding:5px 0 0 10px">暂无数据</p>');
        }

        html.push('</html>');
        return html.join('');
    },
    queryAll: function(isRetry, times) {
        var that = this;
        that.date = getYesterday();
        logger.info('Send mail query all start');
        that.userService.queryListByCondition({
            applyId: -1,
            role: -1
        }, function(err, userlist) {
            if (err) {
                return logger.error('Send email userService queryListByCondition error');
            } else {
                var orderByApplyId = {};
                userlist.forEach(function(v) {
                    // 兼容没有登陆过的用户，自动拼接 邮箱后缀
                    if(!v.email){
                        v.email = v.loginName + GLOBAL.pjconfig.email.emailSuffix;
                    }
                    if (orderByApplyId[v.applyId]) {
                        orderByApplyId[v.applyId].push(v);
                    } else {
                        orderByApplyId[v.applyId] = [v];
                    }
                });
                for (var applyId in orderByApplyId) {
                    (function(users , applyId) {
                        var to_list = []; // 收件方
                        var cc_list = []; // 抄送方
                        var name = '';
                        users.forEach(function(v) {
                            v.role === 0 ? cc_list.push(v.email) : to_list.push(v.email);
                            name = v.name;
                        }); // jshint ignore:line

                 /*       if(applyId != 991){
                            return ;
                        }

                        to_list = ["chriscai@tencent.com"];
                        cc_list = [];*/

                        that.statisticsService.queryById({
                            top: that.top,
                            projectId: applyId,
                            startDate: that.date
                        }, function(err, data) {
                            if (err) return logger.error('Send email statisticsService queryById error');
                            if ( data &&  data.length > 0) {

                                that.statisticsService.queryByChart({projectId : applyId , timeScope :1} , function (err , chartData){

                                    if(err || chartData.data.length <=0){
                                        that.sendEmail({
                                            to: to_list,
                                            cc: cc_list,
                                            title: name
                                        }, data[0]);
                                    }else {

                                        Exporting(
                                            getImageData(name , chartData.data)
                                         , function (err , image){

                                            if(err){
                                                logger.info("generate image error " + err.toString() + ", id =" + applyId)
                                                that.sendEmail({
                                                    to: to_list,
                                                    cc: cc_list,
                                                    title: name
                                                }, data[0]);
                                            }else {
                                                var imagePath = "static/img/tmp/"  + (new Date -0 + applyId) + ".png";
                                                fs.writeFile( path.join(__dirname , ".." ,  imagePath), new Buffer(image, 'base64'), function() {
                                                    that.sendEmail({
                                                        to: to_list,
                                                        cc: cc_list,
                                                        title: name,
                                                        imagePath :imagePath
                                                    }, data[0] );
                                                });

                                            }
                                        });
                                    }

                               })

                            } else {
                                logger.error('Send email data format error');
                            }
                        }); // jshint ignore:line
                    })(orderByApplyId[applyId] , applyId); // jshint ignore:line
                }
            }
        });
        !isRetry && setTimeout(function() {
            that.queryAll();
        }, 86400000);
    },
    sendEmail: function(emails, data  ) {
        var title = "【BadJS 日报 " + dateFormat(this.date, "yyyy-MM-dd") + "】- " + emails.title;
        data.title = emails.title;
        var content = this.render(data , emails.imagePath  );
        send_email(this.from, emails.to, emails.cc, title, content);
    },
    start: function() {
        var that = this;
        var date = new Date();
        date.setDate(date.getDate() + 1);
        var time = GLOBAL.pjconfig.email.time.toString().split(':');
        date.setHours(parseInt(time[0], 10) || 9, parseInt(time[1], 10) || 0, parseInt(time[2], 10) || 0, 0);
        var timeDiff = date.valueOf() - (new Date()).valueOf();
        setTimeout(function() {
            that.queryAll();
        }, timeDiff);
        logger.info('Email service will start after: ' + timeDiff);
    }
};

module.exports = EmailService;