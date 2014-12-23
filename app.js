var express = require('express')
  , tpl = require('express-micro-tpl')
  , valid = require('url-valid')
  //, passport = require('passport')
  , flash = require('connect-flash')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , LocalStrategy = require('passport-local').Strategy
  , serveStatic = require('serve-static')
  , middlewarePipe = require('middleware-pipe')
  , sass = require('gulp-sass')
  , tplPlugin = require('./gulp/tpl')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io')(server)
  , router = require('./controller/router') ;

var users = [
  { id: 1, username: 'admin', password: 'pass', email: 'donaldyang@tencent.com' }
];

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  var user;
  for (var i = 0, l = users.length; i < l; i++) {
    user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


app
  .set('views', __dirname + '/views')
  .set('view engine', 'html')
  .engine('html', tpl.__express)
  .use(session({ secret: 'keyboard cat', cookie: { maxAge: 30 * 60 * 1000 } }))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(flash())
  .use('/css', middlewarePipe('./static/css',
    /\.css$/, function (url) {
      return url.replace(/\.css$/, '.scss');
    }).pipe(function () {
      return sass()
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


