
var mysql = require('mysql');

var conn = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '123456',
    database : 'badjs'

});

conn.connect(function(err ) {
    if(err){
        throw e;
    }

    console.log('good');
});

