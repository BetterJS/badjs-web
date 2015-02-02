/**
 * Created by chriscai on 2015/1/12.
 */
var http = require('http');

var  log4js = require('log4js'),
     Apply = require('../model/Apply'),
     http = require('http'),
     _ = require('underscore'),
     logger = log4js.getLogger(),
     ORM = require("orm");


var dateFormat  = function (date , fmt){
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

var StatisticsService = function (){

    this.statisticsDao = global.models.statisticsDao;
    this.applyDao = global.models.applyDao;

    if(GLOBAL.DEBUG){
        this.url = 'http://183.60.70.234:9000/errorMsgTop';
    }else {
        this.url = 'http://10.143.132.205:9000/errorMsgTop';
    }

    logger.debug('query url : ' + this.url);
};



StatisticsService.prototype = {
    queryById : function (param  , callback){

        this.statisticsDao.find({projectId :param.projectId , startDate : dateFormat(param.startDate , 'yyyy-MM-dd hh:mm:ss')} , function (err , items){
            if(err){
                callback(err);
                return;
            }
            callback(null,{ret:0, msg:"success", data: items});
        });

    },
    queryByChart : function (param  , callback){
        //筛选参数
        var s_params = {};
        if(param.projectId !=-1){
            s_params.projectId = param.projectId;
        }

        //时间开始范围 7天内 或者1个月内
        var oneDay = 1000 * 60 * 60 * 24;
        var day = param.timeScope ==1?7:30;
        param.startTime = new Date() - oneDay * day;
        param.startTime = dateFormat(new Date(param.startTime), 'yyyy-MM-dd');

        if(GLOBAL.DEBUG){
            logger.info("query start time is "+ param.startTime);
        }
        this.statisticsDao.find(s_params).where("startDate >=?", [param.startTime]).all(function (err, items)  {
            if(err){
                callback(err);
                return;
            }
            callback(null,{ret:0, msg:"success", data: items});
        }).where(function(){

        });


    },
    fetchAndSave : function (id , startDate , cb){
        var self = this;
        http.get((this.url + '?id=' + id + '&startDate=' + (startDate -0 ))  , function(res){
            var buffer = '';
            res.on('data' , function (chunk){
                buffer += chunk.toString();
            }).on('end' , function (){
                var saveModel = {};
                try {
                    var result = JSON.parse(buffer);

                    saveModel = {
                        startDate : new Date(result.startDate),
                        endDate : new Date(result.endDate),
                        content : JSON.stringify(result.result),
                        projectId : id,
                        total : 0
                    };

                    _.each(result.result , function (value ,key ){
                            saveModel.total += result.result[key];
                    })

                }catch(e){
                    logger.error('error :' + err);
                    saveModel = {
                        startDate: startDate,
                        endDate: startDate + 86400000,
                        content: "{}",
                        total: 0
                    }
                }

                self.statisticsDao.create(saveModel , function (err , items){
                    if(err){
                        logger.error("Insert into b_statistics error(id=", id + ") :  " +  err);
                    }
                    logger.info("Insert into b_statistics success(id=", id + ") :  " + buffer.toString());
                    cb && cb(err);
                });
            })

        }).on('error' , function (err){
            logger.error('error :' + err);
        });
    },

    startMonitor : function (){
        var self = this;


        var getTomrrowDay = function (){
            return new Date(nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1)  + "-" + (nowDate.getDate()+1) + " 01:00:00");
        }

        var getStartDay = function (){
            return new Date(nowDate.getFullYear() + "-" + (nowDate.getMonth() + 1) +  "-" + (nowDate.getDate()) + " 00:00:00");
        }

        var nowDate = new Date ;
        var targetDate = getTomrrowDay();

        var startTimeout = function (){
            var afterDate = targetDate - nowDate;
            if(isNaN(afterDate)){
                logger.info( "afterDate error : targetDate" + targetDate + " , now:" + nowDate);
                return ;
            }
            setTimeout(function (){
                var startDate = getStartDay();
                self.applyDao.find({status: Apply.STATUS_PASS} , function (err , item){
                    if(err){
                        logger.error("find apply erro  :  " +  err);
                    }
                    _.each(item , function (value ,key ){
                        self.fetchAndSave(value.id , startDate );
                    })

                    nowDate = new Date();
                    startDate = getStartDay();
                    targetDate =  getTomrrowDay();

                    startTimeout();
                })



            } , afterDate);

            logger.info( "after " + ((afterDate )/1000) + "s will fetch again ");
        }

        startTimeout();

    }
};




module.exports =  StatisticsService;
