var mysql = require('mysql'),
    StatisticsService = require('../service/StatisticsService'),
    orm = require('orm');

GLOBAL.DEBUG = true;
var mysql = "mysql://badjs:pass4badjs@10.134.5.103:3306/badjs";
//var mysql = "mysql://root:root@localhost:3306/badjs";

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


    var aa = new StatisticsService();


    var startDate = new Date('2014-12-09 00:00:00');
    var nowDate = new Date;

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

    fetch(991 , startDate);

});





