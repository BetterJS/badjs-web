var _ = require("underscore")
var http = require('http');
var id = 1;

var startDate = 1472054400000
        http.get((  'http://127.0.0.1:9000/errorMsgTop?id='+id+'&startDate=' + (startDate)), function(res) {
            var buffer = '';
            res.on('data', function(chunk) {
                buffer += chunk.toString();
            }).on('end', function() {
                    console.log(buffer.length)
                try {
                    var result = JSON.parse(buffer);
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
