/**
 * @info : 页面申请路由
 * @author : coverguo
 * @date : 2014-12-16
 */

var LogAction = require('./action/LogAction'),
    ApplyAction = require('./action/ApplyAction'),
    UserAction = require("./action/UserAction"),
    IndexAction = require("./action/IndexAction"),
    StatisticsAction = require("./action/StatisticsAction"),
    ApproveAction = require("./action/ApproveAction"),
    realtimeService = require("../service/RealtimeService"),
    UserApplyAction = require("./action/UserApplyAction");

var _ = require("underscore");


var log4js = require('log4js'),
    logger = log4js.getLogger();

module.exports = function(app){


    realtimeService(app);

    //html页面请求
    app.get('/', function (req , res){
        res.render('index',{} );
    });

    app.get('/index.html', function (req , res){
        res.render('index',{} );
    } );

    app.get('/user/index.html', function (req , res){
        IndexAction.index({} , req , res);
    } );

    app.use('/login.html', function (req , res){
        UserAction.login({}, req , res);
    } );

    app.use('/register.html', function (req , res){
        UserAction.register({}, req , res);
    } );

    app.get('/user/apply.html', function(req, res){
        var user  = req.session.user;
        if(req.query && req.query.applyId){
            ApplyAction.queryByApplyId({applyId :req.query.applyId } , function (err , apply){
                res.render('apply', { layout: false, user: user, index:'apply' , apply : apply });
            });
        }else {
            res.render('apply', { layout: false, user: user, index:'apply' , apply  : {} });
        }
    });
    app.get('/user/applyList.html', function(req, res){
        var user = req.session.user;
        res.render('applyList', { layout: false, user: user, index:'manage', manageTitle: '申请项目列表'});
    });

    app.get('/user/userManage.html', function (req , res){
        UserAction.index({} , req , res);
    });
    app.use('/user/modifyUser.html', function (req , res){
        UserAction.modify(req.param  , req , res);
    });

    app.get('/user/authUserManage.html', function (req , res){
        UserAction.authUserManger(req.param , req , res);
    });

    app.get('/user/statistics.html' , function (req , res){
        StatisticsAction.index({tpl:"statistics", statisticsTitle: "日志统计"} , req , res);
    });
    app.get('/user/realtimelog.html' , function (req , res){
        IndexAction.realtime({} , req , res);
    });

    app.get('/user/offlinelog.html' , function (req , res){
        IndexAction.offline({} , req , res);
    });


    app.get('/user/charts.html' , function (req , res){
        StatisticsAction.index({tpl:"charts", statisticsTitle: "图表统计"} , req , res);
    });
    app.get('/user/projectTotal.html' , function (req , res){
        StatisticsAction.projectTotal({tpl:"projectTotal", statisticsTitle: "项目统计"} , req , res);
    });
    app.get('/user/introduce.html' , function (req , res){
        res.render('introduce', { layout: false, user: req.session.user, index:'guide', guideTitle: '使用指南'});
    });

    app.get('/user/monitor.html' , function (req , res){
        res.render('monitor', { layout: false, user: req.session.user, index:'guide', guideTitle: '实时监控'});
    });


    /**
     * 登出
     * */
    app.get('/logout', function(req, res){
        req.session.user = null;
        var homeUrl = req.protocol + "://" + req.get('host') + '/index.html';
        delete req.session.user;
        res.redirect(homeUrl);
    });


    // 请求路径为： controller/xxxAction/xxx.do (get || post)
    app.use("/",function(req, res , next){
        //controller 请求action
            if(!/\/controller/i.test(req.url)){
                next();
                return ;
            }
            var url = req.url;
            var action = url.match(/controller\/(\w*)Action/i)[1];
            var operation = url.match(/\/(\w+)\.do/i)[1];
            logger.debug("the operation is: " + action + " --operation: "+ operation);
            //判断是get还是post请求， 获取参数params
            var method = req.method.toLowerCase();
            var params = method =="post"? req.body : req.query;

            params = _.extend({} , params );

            params.user = req.session.user;


            if( !params.user ){
                res.json({ret : -2 , msg : "should login"});
                return ;
            }

            //根据不同actionName 调用不同action
            try{
                switch(action){
                    case "user": UserAction[operation](params,req, res);break;
                    case "apply": ApplyAction[operation](params,req,  res);break;
                    case "approve": ApproveAction[operation](params,req, res);break;
                    case "log" : LogAction[operation](params,req, res); break;
                    case "userApply": UserApplyAction[operation](params,req, res);break;
                    case "statistics" : StatisticsAction[operation](params, req, res); break;

                    default  : next();
                }
            }catch(e){
                logger.warn(e)
                res.send(404, 'Sorry! can not found action.');
            }
            return;
    });


};
