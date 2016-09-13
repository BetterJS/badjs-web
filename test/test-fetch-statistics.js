
var mysql = require('mysql'),
    StatisticsService = require('../service/StatisticsService'),
    orm = require('orm');

GLOBAL.pjconfig = require('../project.json');
//GLOBAL.DEBUG = true;
var mysqlUrl = GLOBAL.pjconfig.mysql.url

orm.connect( mysqlUrl, function(err , db) {
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


    var aa = new StatisticsService();


    var startDate = new Date('2015-09-23 00:00:00');
    var nowDate = new Date;
    var id = 991;
    //fetch data until today
        aa.fetchAndSave(id , startDate , function (){
            console.log(startDate.toLocaleDateString() + " ok ");

        })

    //fetch(24 , startDate);

});



