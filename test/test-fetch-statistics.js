var _ = require("underscore")
var http = require('http');
var id = 2;

var startDate = 1472054400000
        http.get((  'http://127.0.0.1:9000/errorMsgTop?id=2&startDate=' + (startDate)), function(res) {
            var buffer = '';
            res.on('data', function(chunk) {
                buffer += chunk.toString();
            }).on('end', function() {
                try {
                    var result = JSON.parse(buffer);
                    console.log(buffer.length)
                    _.forEach(result.item, function(value, key) {
                        value.title = value._id;
                        delete value._id;
                    });
                } catch (err) {
                    console.error('parse statistic result error('+id+') :' + err);
                }
            });

        }).on('error', function(err) {
            console.error('error :' + err);
        });
