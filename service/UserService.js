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
    this.db = global.models.db;
};



UserService.prototype = {
    //根据指定条件查询所有项目的项目成员
    admin :{
        QueryListByCondition : function (target , callback){
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
        //查询所有项目的项目成员列表
        queryAllList : function (target , callback){
            var self = this;
            params ={};
            this.userApplyDao.find(params, function(err, userApplyData){
                if(err){
                    callback(err);
                }else{
                    userApply = userApplyData;
                    console.log(userApplyData);
                }
                self.userDao.all({}, function (err , userData){

                    if(err){
                        callback(err);
                    }

                    if(userApply !=[]){
                        var newItems = [];
                        for(var i = 0, len= userData.length; i<len; i++){
                            for(var j = 0, length = userApply.length; j<length; j++){
                                if(userData[i].id == userApply[j].userId){
                                    userData[i].projectRole = userApply[j].role;
                                    //uad == userApplyId
                                    userData[i].uad = userApply[j].id;
                                    newItems.push(userData[i]);
                                }
                            }

                        }
                        userData = newItems;
                    }
                    callback(null,userData);
                });
            });

        }
    },

    queryListByCondition : function (target , callback){

        var string = "select ua.id, u.loginName, u.chineseName, ua.applyId, ua.role, a.name "+
            "from  b_user as u join b_user_apply as ua on(ua.userId = u.id) "+
            "join b_apply as a on (a.id =ua.applyId) "+
            "where applyId in(select applyId from b_user_apply where userId =? "+
            " and role = 1) ";
        var condition = [target.user.id];
        if(target.applyId !=-1){
            string += "and applyId =? ";
            condition.push(target.applyId);
        }
        if(target.role !=-1){
            string += "and ua.role =? ";
            condition.push(target.role);
        }
        console.log(string);
        this.db.driver.execQuery(string,condition, function (err, data) {
            if(err){
                callback(err);
                return;
            }
            callback(null, data);
        });

    },
    //查询用户创建项目的项目成员列表
    queryListByUserProject : function(target, callback){

        var string = "select ua.id, u.loginName, u.chineseName, ua.applyId, ua.role, a.name "+
                     "from  b_user as u join b_user_apply as ua on(ua.userId = u.id) "+
                     "join b_apply as a on (a.id =ua.applyId) "+
                     "where applyId in(select applyId from b_user_apply where userId =?"+
                     " and role = 1);";
        //console.log(string);
        this.db.driver.execQuery(string,[target.user.id], function (err, data) {
            if(err){
                callback(err);
                return;
            }
            callback(null, data);
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



