/**
 * Created by coverguo on 2015/01/12.
 */

var http = require('http');

var log4js = require('log4js'),
    logger = log4js.getLogger();



var ApproveService = function() {
    this.approveDao = global.models.approveDao;
    this.applyDao = global.models.applyDao;

};



ApproveService.prototype = {
    query: function(target, callback) {


        //管理员
        if (target.user.role == 1) {
            this.approveDao.all({}, function(err, items) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, {
                    ret: 0,
                    msg: "success",
                    data: items
                });
            });
        } else {
            this.approveDao.find({
                userName: target.user.loginName
            }, function(err, items) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null, {
                    ret: 0,
                    msg: "success",
                    data: items
                });
            });
        }


    },
    add: function(target, callback) {
        var self = this;
        this.approveDao.create(target, function(err, items) {
            if (err) {
                callback(err);
                return;
            }
            logger.info("Insert into b_approve success! target: ", target);
            // 改变申请表状态
            var apply = {
                id: parseInt(target.applyId, 10),
                status: parseInt(target.applyStatus, 10)
            };
            if (target.applyStatus == 1) {
                apply.passTime = target.createTime;
            }
            self.update(apply, function(err, data) {
                if (err) {
                    callback(err);
                    return;
                }
                logger.info("Update b_apply success! apply: ", apply);
                callback(null, {
                    ret: 0,
                    msg: "success add"
                });
            })

        });

    },
    remove: function(target, callback) {

    },
    update: function(target, callback) {
        this.applyDao.one({
            id: target.id
        }, function(err, apply) {
            // SQL: "SELECT * FROM b_apply WHERE name = 'xxxx'"
            for (key in target) {
                apply[key] = target[key];
            }
            apply.save(function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                callback(null);
            });
        });
    }
}


module.exports = ApproveService;
