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
    UserApplyAction = require("./action/UserApplyAction");


var log4js = require('log4js'),
    logger = log4js.getLogger();

module.exports = function(app){

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


    app.get('/user/apply.html', function(req, res){
        var user  = req.session.user;
        res.render('apply', { layout: false, user: user, index:'apply' });
    });
    app.get('/user/applyList.html', function(req, res){
        var user = req.session.user;
        res.render('applyList', { layout: false, user: user, index:'manage', manageTitle: '申请列表'});
    });

    app.get('/user/userManage.html', function (req , res){
        UserAction.index({} , req , res);
    });

    app.get('/user/statistics.html' , function (req , res){
        StatisticsAction.index({tpl:"statistics", statisticsTitle: "日志统计"} , req , res);
    });
    app.get('/user/realtimelog.html' , function (req , res){
        IndexAction.realtime({} , req , res);
    });
    app.get('/user/charts.html' , function (req , res){
        StatisticsAction.index({tpl:"charts", statisticsTitle: "图表统计"} , req , res);
    });
    app.get('/user/introduce.html' , function (req , res){
        res.render('introduce', { layout: false, user: req.session.user, index:'guide', guideTitle: '使用指南'});
    });
/*
    app.get('/introduce.html' , function (req , res){
        res.render('introduce', { layout: false, user: req.session.user, index:'guide', guideTitle: '系统介绍'});
    });
*/


    /**
     * 登出
     * */
    app.get('/logout', function(req, res){
        var signoutUrl = 'http://passport.oa.com/modules/passport/signout.ashx?url={yourWebsite}';
        req.session.user = null;
        var homeUrl = req.protocol + "://" + req.get('host')+'/';
        signoutUrl = signoutUrl.replace('{yourWebsite}', encodeURIComponent(homeUrl));
        res.redirect(signoutUrl);
    });

    // 请求路径为： controller/xxxAction/xxx.do (get || post)
    app.use("/controller",function(req, res , next){
        //controller 请求action
            var url = req.url;
            var action = url.match(/controller\/(\w*)Action/i)[1];
            var operation = url.match(/\/(\w+)\.do/i)[1];
            if(GLOBAL.DEBUG){
                logger.info("the operation is: " + action + " --operation: "+ operation);
            }
            //判断是get还是post请求， 获取参数params
            var method = req.method.toLowerCase();
            var params = method =="post"? req.body : req.query;
            params.user = req.session.user;

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
                res.send(404, 'Sorry! can not found action.');
            }
            return;
    });


};
