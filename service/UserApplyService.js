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
            }

           // console.log(item);
            if(item){
                userApply.userId = item.id;

                self.userApplyDao.create(userApply , function (err , items){
                    if(err){
                        callback(err);
                        return;
                    }
                    logger.info("Insert into b_user_apply success! target1: ",items);
                    callback(null);
                });
            }


        })


    },
    remove : function(target, callback){

    },
    update : function(target, callback){

    }
}


module.exports =  userApplyService;

