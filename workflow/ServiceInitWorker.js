var log4js = require('log4js'),
    logger = log4js.getLogger();






module.exports = function (){
    setTimeout(function (){
        var service = require("../service/StatisticsService");
        logger.info('start startMonitor ...');
        new service().startMonitor();


        var LogService = require("../service/LogService");
        new LogService().pushProject(function (e){
            logger.info('push project on system start');
        });
        
        // 邮件报表
        var EmailService = require("../service/EmailService");
        logger.info('start email report ...');
        new EmailService().start();
    },3000)
}