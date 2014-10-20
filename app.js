var express = require('express')
  , app = express();

app
  .set('views', __dirname + '/views')
  .set('view engine', 'jade')
  .get('/', function (req, res) {
    res.render('index', { users: 'miniflycn' })
  })
  .use(function (err, req, res, next) {
    res.send(err.stack);
  })
  .listen(3000);