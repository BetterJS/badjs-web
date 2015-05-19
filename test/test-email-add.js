var mysql = require('mysql'),
    orm = require('orm');

var mysql = "mysql://root:root@localhost:3306/badjs";
//var mysql = "mysql://badjs:pass4badjs@10.134.5.103:3306/badjs";

orm.connect( mysql, function(err , db) {
    if(err){
        throw err;
    }

  var   userDao = require('../dao/UserDao')(db)

    userDao.find({} , function (err , item){

        item.forEach(function (value){
            value.email = value.loginName + "@tencent.com";
            value.save();
        })



    })

});





