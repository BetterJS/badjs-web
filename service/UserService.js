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
    queryListByProject : function (target , callback){

        //var parmas = {applyId : target.applyId};
        this.userDao.all({}, function (err , items){
            if(err){
                callback(err);
            }
            callback(null,items);
        });

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
        this.userDao.one({id: target.id }, function (err, user) {
            // SQL: "SELECT * FROM b_apply WHERE name = 'xxxx'"
            user.each(function(key, value){
                user[key] = value;
            });
            user.save(function (err) {
                // err.msg = "under-age";
            });
        });
    }
}


module.exports =  UserService;



