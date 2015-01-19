/**
 /**
 * Created by coverguo on 2015/1/12.
 */

var http = require('http');

var  log4js = require('log4js'),
    logger = log4js.getLogger();



var UserService = function (){
    this.userDao = global.models.userDao;
    this.userApplyDao = global.models.userApplyDao;
};



UserService.prototype = {
    queryListByCondition : function (target , callback){
        var users;
        var self = this,
            params = {};
        if(target !={}){
            if(target.applyId !=-1){
                params.applyId = target.applyId;
            }
            if(target.role !=-1){
                params.role = target.role;
            }
        }

        console.log(params);
        this.userApplyDao.find(params, function(err, userApply){
            if(err){
               callback(err);
            }else{
                users = userApply;
                console.log(userApply);
            }
            self.userDao.all({}, function (err , userData){

                if(err){
                    callback(err);
                }

                if(users !=[]){
                    var newItems = [];
                    for(var i = 0, len= userData.length; i<len; i++){
                        for(var j = 0, length = users.length; j<length; j++){
                            if(userData[i].id == users[j].userId){
                                userData[i].projectRole = users[j].role;
                                newItems.push(userData[i]);
                            }
                        }

                    }
                    userData = newItems;
                }
                callback(null,userData);
            });
        });


    },
    queryAllList : function (target , callback){
        var self = this;
        params ={};
        this.userApplyDao.find(params, function(err, userApply){
            if(err){
                callback(err);
            }else{
                users = userApply;
                console.log(userApply);
            }
            self.userDao.all({}, function (err , userData){

                if(err){
                    callback(err);
                }

                if(users !=[]){
                    var newItems = [];
                    for(var i = 0, len= userData.length; i<len; i++){
                        for(var j = 0, length = users.length; j<length; j++){
                            if(userData[i].id == users[j].userId){
                                userData[i].projectRole = users[j].role;
                                newItems.push(userData[i]);
                            }
                        }

                    }
                    userData = newItems;
                }
                callback(null,userData);
            });
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



