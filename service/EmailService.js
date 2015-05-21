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

var send_email = require("../utils/" + GLOBAL.pjconfig.email.module);
var dateFormat = require("../utils/dateFormat");

var EmailService = function() {
    this.userService = new UserService();
    this.statisticsService = new StatisticsService();
    this.top = parseInt(GLOBAL.pjconfig.email.top, 10) || 20;
    this.from = GLOBAL.pjconfig.email.from || "noreply-badjs@tencent.com";
};

var getYesterday = function() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return date;
};

EmailService.prototype = {
    render: function(data) {
        var that = this;
        data = data || {};
        var html = [];
        html.push('<html>');
        html.push('<h3>【BadJS日报邮件】 ' + data.title + '</h3>');
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
                        .replace(/{{desc}}/g, v.title)
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
                    if (orderByApplyId[v.applyId]) {
                        orderByApplyId[v.applyId].push(v);
                    } else {
                        orderByApplyId[v.applyId] = [v];
                    }
                });
                for (var applyId in orderByApplyId) {
                    var users = orderByApplyId[applyId];
                    var to_list = []; // 收件方
                    var cc_list = []; // 抄送方
                    var name = '';
                    users.forEach(function(v) {
                        v.role === 0 ? cc_list.push(v.email) : to_list.push(v.email);
                        name = v.name;
                    }); // jshint ignore:line

                    if(applyId != 8){
                        continue;
                    }
                    that.statisticsService.queryById({
                        top: that.top,
                        projectId: applyId,
                        startDate: that.date
                    }, function(err, data) {
                        if (err) return logger.error('Send email statisticsService queryById error');
                        if (data && data.data && data.data[0]) {
                            that.sendEmail({
                                to: to_list,
                                cc: cc_list,
                                title: name
                            }, data);
                        } else {
                            logger.error('Send email data format error');
                        }
                    }); // jshint ignore:line
                }
            }
        });
        !isRetry && setTimeout(function() {
            that.queryAll();
        }, 86400000);
    },
    sendEmail: function(emails, data) {
        var title = "【" + dateFormat(this.date, "yyyy-MM-dd") + " BadJS 日报】- " + emails.title;
        data.title = emails.title;
        var content = this.render(data);
        send_email(this.from, emails.to, emails.cc, title, content, data);
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
        logger.debug('Email service will start after: ' + timeDiff);
    }
};

module.exports = EmailService;