/* global global, GLOBAL, module */
/**
 * Created by kaelyang on 2015/5/19.
 */
var http = require('http');

var log4js = require('log4js');
var logger = log4js.getLogger();
var _ = require('underscore');
var UserService = require('./UserService');
var dateFormat = require("../utils/dateFormat");

var send_email = require("../utils/" + GLOBAL.pjconfig.email.module);

var EmailService = function() {
    this.userService = new UserService();
    this.statisticsDao = global.models.statisticsDao;
    this.top = parseInt(GLOBAL.pjconfig.email.top, 10) || 20;
    this.from = GLOBAL.pjconfig.email.from || "noreply-betterjs@tencent.com";
};

var getYestoday = function() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    date.setHours(0, 0, 0, 0);
    return date;
};

var formatData = function(data){
    data.content = JSON.parse(data.content);
    data.content = _.map(data.content, function(value, key) {
        return {
            title: key,
            total: value
        };
    });

    data.content = data.content.sort(function(x, y) {
        return x.total < y.total ? 1 : -1;
    });

    return data;
};

EmailService.prototype = {
    render: function(datas) {
        var that = this;
        datas = datas || {};
        var html = [];
        html.push('<html>');
        var empty_tips = '<p>暂无数据</p>';
        if (datas.ret === 0) {
            var data = formatData(datas.data[0]);
            var content = data.content;
            if (content.length > 0) {
                content = content.slice(0, that.top);
                html.push('<h3>【BadJS日报邮件】 ' + datas.title + '</h3>');
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
                total > 0 && html.push('<p style="border-top:1px solid #dedede;margin:20px 0 0 10px">共 {{total}} 条记录, Top {{top}} 占 {{per}}.</p>'
                    .replace(/{{total}}/g, total)
                    .replace(/{{top}}/g, that.top)
                    .replace(/{{per}}/g, (total_top * 100 / total).toFixed(2) + '%')
                );
            } else {
                html.push(empty_tips);
            }
        } else {
            html.push(empty_tips);
        }
        html.push('</html>');
        return html.join('');
    },
    queryAll: function(isRetry) {
        var that = this;
        that.date = getYestoday();
        that.userService.queryListByCondition({
            applyId: -1,
            role: -1
        }, function(err, userlist) {
            if (err) {
                // 一个小时后重试
                setTimeout(function() {
                    that.queryAll(true);
                }, 3600000);
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
                    that.statisticsByApplyId(applyId, function(err, data) {
                        if (err) return;
                        that.sendEmail({
                            to: to_list,
                            cc: cc_list,
                            title: name
                        }, data);
                    }); // jshint ignore:line
                }
            }
        });
        !isRetry && setTimeout(function() {
            that.queryAll();
        }, 86400000);
    },
    statisticsByApplyId: function(applyId, callback) {
        var that = this;
        this.statisticsDao.find({
            projectId: applyId,
            startDate: dateFormat(this.date, 'yyyy-MM-dd hh:mm:ss')
        }, function(err, items) {
            if (err) {
                return callback(err);
            }
            callback(null, {
                ret: 0,
                msg: "success",
                data: items.slice(0, 1)
            });
        });
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
        date.setHours(parseInt(time[0], 10) || 9);
        date.setMinutes(parseInt(time[1], 10) || 0);
        date.setSeconds(parseInt(time[2], 10) || 0);
        var timeDiff = 1000; // date.valueOf() - (new Date()).valueOf();
        setTimeout(function() {
            that.queryAll();
        }, timeDiff);
        logger.debug('Email service will start after: ' + timeDiff);
    }
};

module.exports = EmailService;