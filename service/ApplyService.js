/**
 * Created by coverguo on 2015/01/08.
 */

var http = require('http');

var log4js = require('log4js'),
    logger = log4js.getLogger();

var UserApplyService = require('./UserApplyService');

var LogService = require('./LogService');



var ApplyService = function() {
    this.applyDao = global.models.applyDao;
    this.userApplyDao = global.models.userApplyDao;
};



var logService = new LogService();
var pushProject = function(from) {
    logService.pushProject(function(err) {
        if (err) {
            logger.warn('push project  error ' + err);
        } else {
            logger.info('push project success from ' + from + ' .');
        }
    });
}



ApplyService.prototype = {

    queryListByAdmin: function(target, callback) {

        this.applyDao.find(["createTime", "Z"], function(err, items) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, items);
        });
    },
    queryListByUser: function(target, callback) {
        this.applyDao.find({
            userName: target.user.loginName
        }, ["createTime", "Z"], function(err, items) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, items);
        });
    },
    queryListBySearch: function(searchParam, callback) {


        this.applyDao.find(searchParam, ["createTime", "Z"], function(err, items) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, items);
        });
    },
    add: function(target, callback) {
        var self = this;
        var userId = target.user.id;
        this.applyDao.create(target, function(err, newApply) {
            if (err) {
                callback(err);
                return;
            }
            logger.debug("Insert into b_apply success! target1: " + newApply.id);
            //创建项目的即为管理员 故role ==1
            var userApply = {
                userId: userId,
                applyId: newApply.id,
                role: 1,
                createTime: new Date()
            };
            self.userApplyDao.create(userApply, function(err, items) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null);
            })

        });
    },
    remove: function(target, callback) {
        this.applyDao.one({
            id: target.id
        }, function(err, apply) {
            // SQL: "SELECT * FROM b_apply WHERE name = 'xxxx'"
            if (err || !apply) {
                callback(new Error("can not found apply , id" + target.id));
                return;
            }
            for (var key in target) {
                apply[key] = target[key];
            };
            apply.remove(function(err) {

                if (err) {
                    console.error("remove error : " + err.toString())
                    throw err;
                }

                var userApplyService = new UserApplyService();

                userApplyService.removeByApplyId({
                    applyId: apply.id
                }, function(err) {
                    if (err) {
                        callback(null);
                    } else {
                        callback(null);
                    }

                });

                pushProject('remove');

            });
        });
    },
    update: function(target, callback) {
        this.applyDao.one({
            id: target.id
        }, function(err, apply) {
            // SQL: "SELECT * FROM b_apply WHERE name = 'xxxx'"
            for (var key in target) {
                apply[key] = target[key];
            };

            apply.save(function(err) {
                // err.msg = "under-age";
                callback(null, {
                    ret: 0,
                    msg: "success update"
                });

                // update project.db
                pushProject('update');
            });
        });
    },
    queryById: function(target, callback) {
        this.applyDao.one({
            id: target.id
        }, function(err, apply) {

            callback(err, apply);
        });
    }
}


module.exports = ApplyService;
