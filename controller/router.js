/**
 * @info : 页面申请路由
 * @author : coverguo
 * @date : 2014-12-16
 */

var logAction = require('./action/LogAction')
var auth = require('../utils/auth');
var signinUrl = 'http://passport.oa.com/modules/passport/signin.ashx?url={yourWebsite}';
var signoutUrl = 'http://passport.oa.com/modules/passport/signout.ashx?url={yourWebsite}';
var decryptTicketUrl = 'http://api.tof.oa.com/api/v1/Passport/DecryptTicketWithClientIP?appkey={appkey}&encryptedTicket={encryptedTicket}&browseIP={browseIP}';
var users = {};

module.exports = function(app){
    var isError = function (res , error){
        if(error){
            console.log(error);
            res.json({ret : 1 , err_msg : error});
            return true;
        }
        return false;

    };
    /**
     * 登录
     * */
     app.get('/', function(req, res){

         var clientIp = req.header('x-forwarded-for') || req.connection.remoteAddress;
         //clientIp = '10.2.64.97';// only for dev time, because when in dev time, clientIp will always be 127.0.0.1, but in real time, you dont need this line
         var user = users[clientIp] || req.session.user;
         console.log('\\', req.session.user);
         //var user = users[clientIp] || req.session.user;
         if (user) {
             req.session.user = user;
             delete users[clientIp];
             res.render('log', { layout: false, user: user });
         } else {

             var homeUrl = req.protocol + "://" + req.get('host');
             console.log('homeurl', homeUrl);
             signinUrl = signinUrl.replace('{yourWebsite}', encodeURIComponent(homeUrl));
             res.redirect(signinUrl);

             if (req.query.ticket) {
                 var headers = auth.info();
                 var appkey = headers.appkey;
                 var encryptedTicket = req.query.ticket;
                 var url = decryptTicketUrl.replace('{appkey}', appkey).replace('{encryptedTicket}', encryptedTicket).replace('{browseIP}', clientIp);
                 request.get({ url: url,  headers: headers }, function (error, response, body) {
                     if (!error && response.statusCode == 200) {
                         var data = JSON.parse(body).Data;
                         users[clientIp] = {
                             loginName: data.LoginName,
                             chinessName: data.ChineseName
                         };
                     } else {
                         console.log(error, body);
                     }
                 });
             }
             users[clientIp] = {
                 loginName: 'coverguo',
                 chinessName: '郭锋棉'
             };
         }
     });
     app.get('/login', function(req, res){
         console.log('login', user);
         var clientIp = req.header('x-forwarded-for') || req.connection.remoteAddress;
         //clientIp = '10.2.64.97';// only for dev time, because when in dev time, clientIp will always be 127.0.0.1, but in real time, you dont need this line
         var user = users[clientIp] || req.session.user;
         if (user) {
             req.session.user = user;
             delete users[clientIp];
             res.render('log', { layout: false, user: user });
         } else {
             var homeUrl = req.protocol + "://" + req.get('host');
             signinUrl = signinUrl.replace('{yourWebsite}', encodeURIComponent(homeUrl));
             res.redirect(signinUrl);

             if (req.query.ticket) {
                 var headers = auth.info();
                 var appkey = headers.appkey;
                 var encryptedTicket = req.query.ticket;
                 var url = decryptTicketUrl.replace('{appkey}', appkey).replace('{encryptedTicket}', encryptedTicket).replace('{browseIP}', clientIp);
                 request.get({ url: url,  headers: headers }, function (error, response, body) {
                     if (!error && response.statusCode == 200) {
                         var data = JSON.parse(body).Data;
                         users[clientIp] = {
                             loginName: data.LoginName,
                             chinessName: data.ChineseName
                         };
                     } else {
                         console.log(error, body);
                     }
                 });
             }
             users[clientIp] = {
                 loginName: 'coverguo',
                 chinessName: '郭锋棉'
             };
         }
    });
    /**
     * 登录
     * */
    app.get('/logout', function(req, res){
        req.session.user = null;
        console.log('user', req.session.user);
        var homeUrl = req.protocol + "://" + req.get('host');
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
