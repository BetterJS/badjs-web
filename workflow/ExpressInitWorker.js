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



app.set('views',path.join(__dirname , ".." , "views"));
app.set('view engine', 'html');
app.engine('html', tpl.__express);
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 120 * 60 * 1000 } }));
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


if(GLOBAL.pjconfig.oos && GLOBAL.pjconfig.oos.module){
    app.use("/user" ,require("../oos/" + GLOBAL.pjconfig.oos.module));
}


app.use("/user" , function (req , res , next){
    if(!req.session.user){
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