var mysql = require('mysql'),
    StatisticsService = require('../service/StatisticsService'),
    orm = require('orm');

GLOBAL.DEBUG = true;
orm.connect( "mysql://root:root@localhost:3306/badjs", function(err , db) {
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


    aa.startMonitor();
});





