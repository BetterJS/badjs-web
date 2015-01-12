/**
 /**
 * Created by coverguo on 2015/1/12.
 */

var http = require('http');

var  log4js = require('log4js'),
    logger = log4js.getLogger();



var UserService = function (){
    this.userDao = global.models.userDao;
};



UserService.prototype = {
    query : function (target , callback){
        if(target.user.role ==1){
            this.userDao.all({} , function (err , items){
                if(err){
                    callback(err);
                }
                callback(null,{ret:0, msg:"success", data: items});
            });
        }

    },
    add: function(target, callback){

        this.userDao.create(target , function (err , items){
            if(err){
                callback(err);
            }
            logger.info("Insert into b_user success! target1: ",target);
            callback(null,{ret:0, msg:"success add"});
        });
    },
    remove : function(target, callback){

    },
    update : function(target, callback){
        this.userDao.find({id: target.id }, function (err, apply) {
            // SQL: "SELECT * FROM b_apply WHERE name = 'xxxx'"
            params[0].each(function(key, value){
                apply[key] = value;
            });
            apply[0].save(function (err) {
                // err.msg = "under-age";
            });
        });
    }
}


module.exports =  UserService;



