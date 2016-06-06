/* global process */

var mq = require(process.env.mqModule);

var log4js = require('log4js'),
    logger = log4js.getLogger();

var mqUrl = process.env.mqUrl;
var service = process.env.service;
var isDebug = process.env.debug == "false" ? false : true;

if (isDebug) {
    logger.setLevel('DEBUG');
}


var filter = {};
var isInclude = function(str, regs) {
    var result = true;

    regs.forEach(function(value, key) {
        if (str.indexOf(value) >= 0) {
            result = result && true;
        } else {
            result = result && false;
        }
    });
    return result;
};

var isExclude = function(str, regs) {
    var result = true;
    regs.forEach(function(value, key) {
        if (str.indexOf(value) >= 0) {
            result = result && true;
        } else {
            result = result && false;
        }
    });

    return result;
};

var getSubscribe = function (str){
    if(process.env.mqModule == "axon") {
            return str + "*"
    }
    return str;
}



var monitorWorker = {

    wbClient: {},

    filter: {},

    monitorKey: '',

    mqClient: null,

    _resetTimeoutFlag: function() {
        this.wbClient._keepalive = new Date - 0;
        this.wbClient._timeoutTimes = 0;
    },

    _keepAliveMonitor: function() {
        var self = this;
        if (this._monitorTimeoutId) {
            clearInterval(this._monitorTimeoutId);
        }
        this._monitorTimeoutId = setInterval(function() {
            var currentDate = new Date - 0;
            if (!self.wbClient._keepalive) {
                self._resetTimeoutFlag();
            }
            if (currentDate - self.wbClient._keepalive > 5000) {
                self.wbClient._timeoutTimes++;
            }

            if (self.wbClient._timeoutTimes > 2) {
                logger.info("one client timeout ");
                process.send({
                    type: "_STOP_"
                });
                self.stopMonitor();
            }
        }, 5000);
    },


    init: function() {
        var self = this;
        process.on("message", function(data) {
            switch (data.type) {
                case "KEEPALIVE":
                    self._resetTimeoutFlag();
                    break;
                case "READY":
                    self._keepAliveMonitor();
                    break;
                case "INIT":
                    self.startMonitor(data);
                    break;
                case "STOP":
                    self.stopMonitor();
                    break;
                default:
                    break;
            }

            if (isDebug) {
                logger.debug("pid=" + process.pid + " , " + JSON.stringify(data));
            }

        });
    },

    isMatch: function(data) {

        try {
            var msg = data.msg + "||" + data.uin + "||" + data.url + "||" + data.userAgent + "||" + data.from;

            if (filter.level.indexOf(data.level) < 0) {
                return false;
            }

            if (filter.include && filter.include.length !== 0) {
                if (!isInclude(msg, filter.include)) {
                    return false;
                }
            }
            if (filter.exclude && filter.exclude.length !== 0) {
                if (isExclude(msg, filter.exclude)) {
                    return false;
                }
            }
        } catch (e) {
            logger.error("isMatch error : " + e + "data :" + JSON.stringify(data));
        }

        return true;
    },

    startMonitor: function(data) {
        var self = this;

        this.monitorKey = service + data.id + "|";

        this.mqClient = mq.socket('sub');

        this.mqClient.connect(mqUrl);
        this.mqClient.subscribe(getSubscribe(this.monitorKey));

        filter = {
            level: data.level,
            include: data.include,
            exclude: data.exclude
        };

        logger.info("worker(" + process.pid + ") start accept service:" + this.monitorKey);


        this.mqClient.on("message", function(data) {
            var dataStr = data.toString();
            data = dataStr.substring(dataStr.indexOf(' '));
            try {
                data = JSON.parse(data);
            } catch (e) {}


            if (self.isMatch(data)) {
                process.send({
                    type: "MESSAGE",
                    message: data
                });
            }

        });
    },

    stopMonitor: function() {
        logger.info("worker(" + process.pid + ") stop accept, service:" + this.monitorKey);
        try {
            this.mqClient && this.mqClient.close();
        } catch (ex) {
            logger.error('mq client close error!');
        }
        this.wbClient = {};
        clearInterval(this._monitorTimeoutId);
    }
};

monitorWorker.init();
