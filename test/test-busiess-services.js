var mysql = require('mysql'),
    BusinessService = require('../service/BusinessService'),
    orm = require('orm');

GLOBAL.DEBUG = true;
//var mysql = "mysql://badjs:pass4badjs@10.134.5.103:3306/badjs";
var mysql = "mysql://root:root@localhost:3306/badjs";

orm.connect( mysql, function(err , db) {
    if(err){
        throw err;
    }

    global.models = {
        userDao : require('../dao/UserDao')(db),
        applyDao : require('../dao/ApplyDao')(db),
        approveDao : require('../dao/ApproveDao')(db),
        statisticsDao : require('../dao/StatisticsDao')(db),
        db : db
    }

    var bs = new BusinessService();

    bs.findBusinessByUser("chriscai" , function (err  ,data){
        console.log(data)
    })

});





