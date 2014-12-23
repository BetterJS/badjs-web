/**
 * @info : 页面申请路由
 * @author : coverguo
 * @date : 2014-12-16
 */

var logAction = require('./action/LogAction')
var auth = require('../utils/auth');
var users = {};
var tof = require('../oa/node-tof');

module.exports = function(app){
    var isError = function (res , error){
        if(error){
            console.log(error);
            res.json({ret : 1 , err_msg : error});
            return true;
        }
        return false;

    };

    app.use(function (req , res , next){
        var params = req.query,
            user  = req.session.user;

        req.indexUrl = req.protocol + "://" + req.get('host') + '/index.html';

        if(/^\/login.html/i.test(req.url)){ // 登录
            var redirectUrl = req.headers.referer || req.indexUrl;
            res.redirect('http://passport.oa.com/modules/passport/signin.ashx?url='+redirectUrl);
            return ;
        }


        if ( params && params.ticket) { // oa 登录跳转
            tof.passport(params.ticket , function (result){
                if(result){
                    req.session.user = {loginName : result.LoginName , chinessName : result.ChineseName};
                    next();
                }else {
                    res.send(403, 'Sorry! you can not see that.');
                }
            });
        } else  if(req.session.user){ // 跳转OA 登录
            next();
        }else {
            res.redirect(req.protocol + "://" + req.get('host') + '/login');
        }
    });
     app.get('/index.html', function(req, res){

         var params = req.query,
             user  = req.session.user;


         res.render('log', { layout: false, user: user });

     });

    app.get('/', function(req, res){

        var params = req.query,
            user  = req.session.user;

        res.render('log', { layout: false, user: user });


    });
    /**
     * 登录
     * */
    app.get('/logout', function(req, res){

        var signoutUrl = 'http://passport.oa.com/modules/passport/signout.ashx?url={yourWebsite}';
        req.session.user = null;
        var homeUrl = req.protocol + "://" + req.get('host')+'/';
        signoutUrl = signoutUrl.replace('{yourWebsite}', encodeURIComponent(homeUrl));
        res.redirect(signoutUrl);
    });
    /**
    * 查看log列表
    * */
    app.get('/controller/action/queryLogList.do', function(req, res){

        paramsStr = decodeURI(req.url.split('?')[1]);
        console.log('query', paramsStr);
        logAction.getLogList(req.query,function(err,data){
            if(isError(res, err)){
               return;
            }
            res.json({ret:0, data: data});
        });

    });
 };
