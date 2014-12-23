var express = require('express')
  , tpl = require('express-micro-tpl')
  , valid = require('url-valid')
  //, passport = require('passport')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , LocalStrategy = require('passport-local').Strategy
  , serveStatic = require('serve-static')
  , middlewarePipe = require('middleware-pipe')
  , tplPlugin = require('./gulp/tpl')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io')(server)
  , router = require('./controller/router') ;


var  log4js = require('log4js'),
    logger = log4js.getLogger();

var argv = process.argv.slice(2);
if(argv.indexOf('--debug') >= 0){
    logger.setLevel('DEBUG');
    GLOBAL.DEBUG = true;
}else {
    logger.setLevel('INFO');
}


app
  .set('views', __dirname + '/views')
  .set('view engine', 'html')
  .engine('html', tpl.__express)
  .use(session({ secret: 'keyboard cat', cookie: { maxAge: 30 * 60 * 1000 } }))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(cookieParser())
  .use('/css', middlewarePipe('./static/css',
    /\.css$/, function (url) {
      return url.replace(/\.css$/, '.scss');
    })
  )
  .use('/js', middlewarePipe('./static/js',
    /\.tpl\.js$/, function (url) {
      return url.replace(/\.js/, '.html');
    }).pipe(function () {
      return tplPlugin();
    })
  )
  .use(serveStatic('static'))
  .use(function (err, req, res, next) {
    res.send(err.stack);
  });

router(app);


server.listen(80);

logger.info('start badjs-web , listen 80 ...');


