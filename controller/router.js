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
    UserApplyAction = require("./action/UserApplyAction"),
    auth = require('../utils/auth'),
    tof = require('../oa/node-tof');

var log4js = require('log4js'),
    logger = log4js.getLogger();

module.exports = function(app){
    var isError = GLOBAL.isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;

    };
    app.use(function (req , res , next){
        var params = req.query,
            user  = req.session.user,
            //获取用户model
            userDao = req.models.userDao;







        //if(GLOBAL.DEBUG ){
        //    user = req.session.user = {loginName: "coverguo", chineseName: '郭锋棉' ,role : 1, id:1}
        //}


        req.indexUrl = req.protocol + "://" + req.get('host') + '/index.html';

        if(/^\/login/i.test(req.url)){ // 登录
            var redirectUrl = req.headers.referer || req.indexUrl;
            res.redirect('http://passport.oa.com/modules/passport/signin.ashx?url='+redirectUrl);
            return ;
        }
        if ( params && params.ticket) { // oa 登录跳转
            tof.passport(params.ticket , function (result){
                if(result){
                    user = req.session.user = {loginName : result.LoginName , chineseName : result.ChineseName, role : 0};
                    userDao.one({ loginName : result.LoginName} ,function (err , user) {
                        if(isError(res,err)){
                            return;
                        }
                        //第一次登陆
                        if(!user){

                            userDao.create(req.session.user, function(err, result){
                                if(isError(res, err)){
                                    return;
                                }

                                req.session.user.role = result.role;
                                req.session.user.id = result.id;
                                logger.info("New User:"+ req.session.user + "insert into db-badjs");
                                next();
                            });
                        }else{
                           logger.info("Old User:"+ req.session.user);
                           req.session.user.role = user.role;
                           req.session.user.id = user.id;

                            // 尚未登录过， 但是添加过，分配中文名字
                            if(!user.chineseName){
                                user.chineseName = result.ChineseName;
                                user.save( function(err, result){
                                });
                            }
                            next();
                        }

                    })

                }else {
                    res.send(403, 'Sorry! you can not see that.');
                }
            });
        } else  if(!req.session.user){
            res.redirect(req.protocol + "://" + req.get('host') + '/login');
            return ;
        } else {
            next();
        }



    });


    //html页面请求
    app.get('/', function (req , res){
        IndexAction.index({} , req , res);
    });

    app.get('/index.html', function (req , res){
        IndexAction.index({} , req , res);
    } );

    app.get('/apply.html', function(req, res){
        var user  = req.session.user;
        res.render('apply', { layout: false, user: user, index:'apply' });
    });
    app.get('/applyList.html', function(req, res){
        var user = req.session.user;
        res.render('applyList', { layout: false, user: user, index:'manage', title: '申请列表'});
    });

    app.get('/userManage.html', function (req , res){
        UserAction.index({} , req , res);
    });

    app.get('/statistics.html' , function (req , res){
        StatisticsAction.index({} , req , res);
    });

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
    app.use(function(req, res , next){
        //controller 请求action
        if(/^\/controller/i.test(req.url)){
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
        }else{
            next();
        }
    });






 };
