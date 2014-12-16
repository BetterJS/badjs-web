var express = require('express')
  , tpl = require('express-micro-tpl')
  , valid = require('url-valid')
  , passport = require('passport')
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

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function (username, password, done) {
    process.nextTick(function () {
      findByUsername(username, function (err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Unknown user ' + username });
        if (user.password != password) return done(null, false, { message: 'Invalid password' });
        return done(null, user);
      })      
    })
  }
));


app
  .set('views', __dirname + '/views')
  .set('view engine', 'html')
  .engine('html', tpl.__express)
  .use(session({ secret: 'keyboard cat' }))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(cookieParser())
  .use(passport.initialize())
  .use(passport.session())
  .use(flash())
  .get('/', function (req, res) {
    req.user ?
      // log page
      res.render('log', { user: req.user }) :
      // introduce page
      res.render('index', { user: req.user });
  })
  .get('/account', ensureAuthenticated, function (req, res) {
    res.render('account', { user: req.user });
  })
  .get('/login', function (req, res) {
    res.render('login', { user: req.user, message: req.flash('error') });
  })
  .post(
    '/login', 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function (req, res) {
      res.redirect('/');
    }
  )
  .get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  })
  .use('/code', function (req, res, next) {
    var urls = req.query.target.split(':')
      , body = [];
    valid(urls[0] + ':' + urls[1])
      .on('check', function (err, valid) {
        if (err || !valid) return next(err);
      }).on('data', function (err, data) {
        if (err) return next(err);
        body.push(data);
      }).on('end', function (err) {
        if (err) return next(err);
        body = Buffer.concat(body).toString();
        res.end(body);
      });
  })
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


server.listen(3000);


