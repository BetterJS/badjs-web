var express = require('express')
  , tpl = require('express-micro-tpl')
  , passport = require('passport')
  , flash = require('connect-flash')
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , LocalStrategy = require('passport-local').Strategy
  , app = express();

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
    res.render('index', { users: 'miniflycn' })
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
  .use(function (err, req, res, next) {
    res.send(err.stack);
  })
  .listen(3000);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}