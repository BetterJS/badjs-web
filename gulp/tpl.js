var map = require('map-stream')
  , tpl = require('micro-tpl');

module.exports = function () {
  return map(function (file, fn) {
    if (file.isNull()) {
      return fn(null, file);
    }

    if (file.isStream()) {
      throw new Error('Don\'t support stream');
    }

    if (file.isBuffer()) {
      file.contents = new Buffer([
        '!function (root) {',
        'root.' + file.path.match(/(\w+)\.tpl\.html/)[1] + ' = ',
        tpl(file.contents.toString()),
        ';',
        '}(window);'
      ].join(''));
      fn(null, file);
    }
  });
};