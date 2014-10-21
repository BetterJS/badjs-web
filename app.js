var express = require('express')
  , tpl = require('express-micro-tpl')
  , app = express();

app
  .set('views', __dirname + '/views')
  .set('view engine', 'html')
  .engine('html', tpl.__express)
  .get('/', function (req, res) {
    res.render('index', { users: 'miniflycn' })
  })
  .use(function (err, req, res, next) {
    res.send(err.stack);
  })
  .listen(3000);