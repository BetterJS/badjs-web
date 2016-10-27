/**
 * Created by coverguo on 2015/01/15.
 */

var http = require('http'),
    log4js = require('log4js'),
    logger = log4js.getLogger();



var userApplyService = function (){
    this.userApplyDao = global.models.userApplyDao;
    this.userDao = global.models.userDao;
};



userApplyService.prototype = {
    query : function (target , callback){


    },
    add: function(target, callback){
        var self = this;
        var userApply ={
            applyId : target.applyId,
            role : 0,
            createTime : new Date()
        };
        this.userDao.one({loginName:target.userName}, function(err, item){
            if(err){
                callback(err);
                return;
            }
            if(item){
                userApply.userId = item.id;

                self.userApplyDao.create(userApply , function (err , items){
                    if(err){
                        callback(err);
                        return;
                    }
                    logger.info("Insert into b_user_apply success! target1: " + items.id);
                    callback(null);
                    return;
                });
            }else {
               var newUser = {
                   loginName : target.userName,
                   role : 0,
                   createTime : new Date()
               };
               self.userDao.create(newUser,function(err){
                   if(err){
                       callback(err);
                       return;
                   }
                   logger.info("Insert into b_user success! ");
                   self.add(target, callback);
               })
            }


        })


    },
    removeByApplyId : function(target, callback){
        this.userApplyDao.find({applyId: target.applyId}).remove( function (err) {
            if(err ){
                callback(err);
            }else {
                callback(null);
            }

        })
    },
    remove : function(target, callback){
        this.userApplyDao.one({id: target.id}, function (err, item) {
            if(err){
                callback(err);
                return;
            }
            item.remove(function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                if (global.DEBUG) {
                    logger.info("remove success item: " + item);
                }
                callback(null);
            });
        })
    },
    auth : function(target, callback){
        this.userApplyDao.one({id: target.id}, function (err, item) {
            if(err){
                callback(err);
                return;
            }
            if(item.role == 1){
                callback("had authed");
                return ;
            }
            item.role = 1;
            item.save(function(err) {
                if (err) {
                    callback(err);
                    return;
                }
                if (global.DEBUG) {
                    logger.info("auth success item: " + item);
                }
                callback(null);
            });
        })
    }
}


module.exports =  userApplyService;

