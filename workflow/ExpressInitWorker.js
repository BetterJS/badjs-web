var express = require('express')
    , tpl = require('express-micro-tpl')
    , crypto = require('crypto')
    , session = require('express-session')
    , bodyParser = require('body-parser')
    , cookieParser = require('cookie-parser')
    , serveStatic = require('serve-static')
    , app = express()
    , router = require('../controller/router')
    , orm = require('orm');

var path = require("path");

var log4js = require('log4js'),
    logger = log4js.getLogger();

var isError = GLOBAL.isError = function (res , error){
    if(error){
        res.json({ret : 1 , msg : error});
        return true;
    }
    return false;

};


app.set('views',path.join(__dirname , ".." , "views"));
app.set('view engine', 'html');
app.engine('html', tpl.__express);
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 30 * 60 * 1000 } }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/static' , serveStatic(path.join(__dirname , ".." , "static")));


var msqlUrl = GLOBAL.pjconfig.mysql.url;


logger.info('connect mysql: ' + msqlUrl);


app.use(orm.express(msqlUrl, {
    define: function (db, models, next) {

    db.use(require("orm-transaction"));
    models.userDao = require('../dao/UserDao')(db);
    models.applyDao = require('../dao/ApplyDao')(db);
    models.approveDao = require('../dao/ApproveDao')(db);
    models.userApplyDao = require('../dao/UserApplyDao')(db);
    models.statisticsDao = require('../dao/StatisticsDao')(db);
    models.db = db;

    global.models = models;
    logger.info('mysql connected');
    next();
}}));




app.use("/user" ,function (req , res , next){
    var params = req.query,
        user  = req.session.user,
        //获取用户model
        userDao = req.models.userDao;

    req.indexUrl = req.protocol + "://" + req.get('host') + '/user/index.html';

    if(/^\/oalogin/i.test(req.url)){ // 登录
        var redirectUrl =  req.indexUrl;
        res.redirect('http://passport.oa.com/modules/passport/signin.ashx?url='+redirectUrl);
        return ;
    }
    if ( params && params.ticket) { // oa 登录跳转
        var   tof = require('../oa/node-tof');
        tof.passport(params.ticket , function (result){
            if(result){
                user = req.session.user = {loginName : result.LoginName , chineseName : result.ChineseName, role : 0};
                userDao.one({ loginName : result.LoginName} ,function (err , dbUser) {
                    if(isError(res,err)){
                        return;
                    }
                    //第一次登陆
                    if(!dbUser){
                        req.session.user.email = user.loginName +  GLOBAL.pjconfig.email.emailSuffix;
                        req.session.user.password = crypto.createHash("md5").update(user.loginName).digest('hex');

                        userDao.create(req.session.user, function(err, result){
                            if(isError(res, err)){
                                return;
                            }

                            req.session.user.role = result.role;
                            req.session.user.id = result.id;

                            logger.info("New User:"+ JSON.stringify(req.session.user) + "insert into db-badjs");
                            next();
                        });
                    }else{
                        logger.info("Old User:"+ JSON.stringify(req.session.user));
                        req.session.user.role = dbUser.role;
                        req.session.user.id = dbUser.id;
                        req.session.user.email = dbUser.email;

                        // 尚未登录过， 但是添加过，分配中文名字
                        if(!dbUser.chineseName){
                            dbUser.chineseName = result.ChineseName;
                            dbUser.save( function(err, result){
                            });
                        }
                        next();
                    }

                });

            }else {
                res.send(403, 'Sorry! you can not see that.');
            }
        });
    } else  if(!req.session.user){
        res.redirect(req.protocol + "://" + req.get('host') + '/login.html');
        return ;
    } else {
        next();
    }
});


app.use(function (err, req, res, next) {
    res.send(err.stack);
});


router(app);






var port = parseInt(GLOBAL.pjconfig.port, 10) || 80;
module.exports = function (){
    app.listen(port);

    logger.info('start badjs-web , listen ' + port + ' ...');
}