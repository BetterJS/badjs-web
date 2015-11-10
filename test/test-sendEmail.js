GLOBAL.pjconfig = require('../project.json');
var EmailService = require('../service/EmailService');

var orm = require('orm');

orm.connect(GLOBAL.pjconfig.mysql.url, function(err, db) {
    if (err) {
        throw err;
    }

    global.models = {
        userDao: require('../dao/UserDao')(db),
        applyDao: require('../dao/ApplyDao')(db),
        approveDao: require('../dao/ApproveDao')(db),
        statisticsDao: require('../dao/StatisticsDao')(db),
        db: db
    };

    var emailService = new EmailService;
    emailService.queryAll(undefined, {
        sendId: 991,
        sendToList: ['chriscai@tencent.com', 'kaelyang@tencent.com'],
        sendCcList: []
    });

});