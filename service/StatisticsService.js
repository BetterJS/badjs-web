/**
 * Created by chriscai on 2015/1/12.
 */
var http = require('http');

var log4js = require('log4js'),
    Apply = require('../model/Apply'),
    http = require('http'),
    _ = require('underscore'),
    logger = log4js.getLogger(),
    ORM = require("orm");

var dateFormat = function(date, fmt) {
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
};

var StatisticsService = function() {

    this.statisticsDao = global.models.statisticsDao;
    this.applyDao = global.models.applyDao;

    //this.triggerUrl = global.pjconfig.storage.errorMsgTopCacheUrl;
    this.url = global.pjconfig.storage.errorMsgTopUrl;

    logger.debug('query url : ' + this.url);
};

StatisticsService.prototype = {
    queryById: function(param, callback) {
        this.statisticsDao.find({
            projectId: param.projectId,
            startDate: dateFormat(param.startDate, 'yyyy-MM-dd hh:mm:ss')
        }, function(err, items) {
            if (err) {
                callback(err);
                return;
            }

            try {
                if (items[0]) {
                    items[0].content = JSON.parse(items[0].content);

                    if (param.top) {
                        items[0].content = items[0].content.slice(0, param.top);
                    }
                }
            } catch (e) {
                callback(e);
                logger.error("queryById error :  " + param.projectId + ", error :" + e.toString());
                return;
            }

            callback(null, items);
        });

    },
    queryByChart: function(param, callback) {
        //筛选参数
        var s_params = {};
        if (param.projectId != -1) {
            s_params.projectId = param.projectId;
        }

        //时间开始范围 7天内 或者1个月内
        var oneDay = 1000 * 60 * 60 * 24;
        var day = param.timeScope == 1 ? 7 : 30;
        param.startTime = new Date() - oneDay * day;
        param.startTime = dateFormat(new Date(param.startTime), 'yyyy-MM-dd');

        if (global.DEBUG) {
            logger.debug("query start time is " + param.startTime);
        }
        this.statisticsDao.find(s_params)
            .only("endDate", "startDate", "projectId", "id", "total")
            .where("startDate >=?", [param.startTime])
            .all(function(err, items) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, {
                    ret: 0,
                    msg: "success",
                    data: items
                });
            }).where(function() {

            });
    },
    fetchAndSave: function(id, startDate, cb) {
        var self = this;
        http.get((this.url + '?id=' + id + '&startDate=' + (startDate - 0)), function(res) {
            var buffer = '';
            res.on('data', function(chunk) {
                buffer += chunk.toString();
            }).on('end', function() {
                var saveModel = {};
                try {
                    //replace emoji to empty , mysql unsupported emoji code
                    buffer=buffer.replace(/\ud83d[\udc00-\udfff]/gi , "")
                    var result = JSON.parse(buffer);

                    _.forEach(result.item, function(value, key) {
                        value.title = value._id;
                        delete value._id;
                    });
                    saveModel = {
                        startDate: new Date(result.startDate),
                        endDate: new Date(result.endDate),
                        content: JSON.stringify(result.item),
                        projectId: id,
                        total: result.pv
                    };
                } catch (err) {
                    logger.error('parse statistic result error(id='+id+') :' + err);
                    saveModel = {
                        startDate: startDate,
                        endDate: new Date(+startDate + 86400000-1),
                        content: "[]",
                        projectId: id,
                        total: 0
                    };
                }
                self.statisticsDao.create(saveModel, function(err, items) {
                    if (err) {
                        logger.error("Insert into b_statistics error(id=", id + ") :  " + err);
                    }
                    logger.info("Insert into b_statistics success(id=", id + ") :  ");
                    cb && cb(err);
                });
            });

        }).on('error', function(err) {
            logger.error('error :' + err);
        });
    },

    //triggerStorageCache: function(ids, startDate, cb) {
    //    http.get((this.triggerUrl + '?ids=' + ids + '&startDate=' + (startDate - 0)), function(res) {
    //        //  res.on("end" , function (){
    //        cb();
    //        // });
    //    }).on('error', function(err) {
    //        cb(err);
    //        logger.error('triggerStorageCache error :' + err);
    //    });
    //},

    startMonitor: function() {
        var self = this;


        var getFetchDate = function() {
            var tomorrow = new Date(nowDate);
            tomorrow.setHours(2, 0, 0, 0);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tomorrow;
        };

        var getStartDay = function() {
            var startDate = new Date(nowDate);
            startDate.setHours(0, 0, 0, 0);
            return startDate;
        };

        var nowDate = new Date;
        var targetDate = getFetchDate();

        var startTimeout = function() {
            var afterDate = targetDate - nowDate;
            // after date 有误，取消循环
            if (isNaN(afterDate) || afterDate < 1000 * 60 * 60) {
                logger.info("afterDate error : targetDate" + targetDate + " , now:" + nowDate);
                return;
            }
            setTimeout(function() {
                var startDate = getStartDay();
                self.applyDao.find({
                    status: Apply.STATUS_PASS
                }, function(err, item) {
                    if (err) {
                        logger.error("find apply error  :  " + err);
                    }

                    var ids = "0";
                    _.each(item, function(value, key) {
                        ids += "_" + value.id;
                    });

                    //self.triggerStorageCache(ids, startDate, function(err) {
                    //    logger.info("trigger success and after 5400000s fetch result");
                        //if (!err) {
                        //    setTimeout(function() {
                                logger.info("start fetching result ... ");
                                var count = 0;
                                _.each(item, function(value, key) {
                                    setTimeout(function (){
                                        self.fetchAndSave(value.id, startDate);
                                    }, count * 500)
                                     count ++;
                                });
                            //}, 5400000); // 1个半小时候后，拉取统计

                        //}
                    //});

                    nowDate = new Date();
                    targetDate = getFetchDate();

                    startTimeout();
                });
            }, afterDate);

            logger.info("after " + ((afterDate) / 1000) + "s will fetch again ");
        };

        startTimeout();

    }
};



module.exports = StatisticsService;
