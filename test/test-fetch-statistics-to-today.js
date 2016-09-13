
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

    //fetch data until today
    var fetch = function (id , startDate){
        aa.fetchAndSave(id , startDate , function (){
            console.log(startDate.toLocaleDateString() + " ok ");
            if((startDate -0) > (nowDate - 0) ){
                console.log("out today");
                return ;
            }
            fetch(id , new Date(startDate.getFullYear() + "-" + (startDate.getMonth()+1)+"-"+ (startDate.getDate()+1)+" 00:00:00"));

        })
    }

    fetch(24 , startDate);

});



