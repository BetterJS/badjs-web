/**
 * Created by coverguo on 2015/01/08.
 */

var http = require('http');

var  log4js = require('log4js'),
    logger = log4js.getLogger();



var ApplyService = function (){
    this.applyDao = global.models.applyDao;
};



ApplyService.prototype = {
    queryListByUser : function (target , callback){
        this.applyDao.find({userName: target.user.loginName} , function (err , items){
            if(err){
                callback(err);
            }
            callback(null,items);
        });
    },
    add: function(target, callback){
        this.applyDao.create(target , function (err , items){
            if(err){
                callback(err);
            }
            if(GLOBAL.DEBUG){
                logger.info("Insert into b_apply success! target1: ",target);
            }
            callback(null);
        });
    },
    remove : function(target, callback){
        this.applyDao.one({id: target.id }, function (err, apply) {
            // SQL: "SELECT * FROM b_apply WHERE name = 'xxxx'"
            for(key in target){
                apply[key] = target[key];
            };
            apply.remove(function (err) {
                callback(null,{ret:0, msg:"success remove"});
            });
        });
    },
    update : function(target, callback){
        this.applyDao.one({id: target.id }, function (err, apply) {
            // SQL: "SELECT * FROM b_apply WHERE name = 'xxxx'"
            for(key in target){
                apply[key] = target[key];
            };
            apply.save(function (err) {
                // err.msg = "under-age";
                callback(null,{ret:0, msg:"success remove"});
            });
        });
    }
}


module.exports =  ApplyService;

