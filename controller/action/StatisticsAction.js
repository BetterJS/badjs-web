/**
 * Created by chriscai on 2015/1/15.
 */


var BusinessService = require('../../service/BusinessService'),
    _ = require('underscore'),
    StatisticsService = require('../../service/StatisticsService');

var  log4js = require('log4js'),
    logger = log4js.getLogger();

var StatisticsAction = {


    index :  function(param, req, res){
        var params = req.query,
            user  = req.session.user;

        var businessService =  new BusinessService();

        businessService.findBusinessByUser(user.loginName , function (err, item){
            res.render('statistics', { layout: false, user: user, index:'statistics' , title:"日志统计",  items : item});
        });
    },
    charts :  function(param, req, res){
        var params = req.query,
            user  = req.session.user;

        var businessService =  new BusinessService();

        businessService.findBusinessByUser(user.loginName , function (err, item){
            res.render('charts', { layout: false, user: user, index:'statistics' , title:"图表统计",  items : item});
        });
    },

    queryById:function (param , req, res ){
        var statisticsService =  new StatisticsService();
        if(!req.query.projectId || isNaN(req.query.projectId) || !req.query.startDate){
            res.json({ret:0 , msg:'success' , data : {} });
            return ;
        }
        statisticsService.queryById({userName : param.user.loginName , projectId : req.query.projectId-0 , startDate : new Date(param.startDate + " 00:00:00")}  , function (err, data){
            if(data.data && data.data[0] ){
                data.data[0].content = JSON.parse(data.data[0].content);
                data.data[0].content = _.map(data.data[0].content, function(value, key){
                    return {title : key , total : value};
                });

                data.data[0].content = data.data[0].content.sort(function ( a, b){
                    if(a.total < b.total){
                        return 1;
                    }else {
                        return -1;
                    }
                })
            }
            res.json(data);
        });
    }
};

module.exports = StatisticsAction;