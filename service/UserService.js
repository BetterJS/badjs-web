/**
 /**
 * Created by coverguo on 2015/1/12.
 */

var http = require('http');

var  Apply = require('../model/Apply');

var  log4js = require('log4js'),
    logger = log4js.getLogger();



var UserService = function (){
    this.userDao = global.models.userDao;
    this.userApplyDao = global.models.userApplyDao;
    this.db = global.models.db;
};



UserService.prototype = {

    queryListByCondition : function (target , callback){

        var string = "select ua.id, u.loginName, u.email, u.chineseName, ua.applyId, ua.role, a.name "+
            "from  b_user as u join b_user_apply as ua on(ua.userId = u.id) "+
            "join b_apply as a on (a.id =ua.applyId)  where a.status=? ";
        var condition = [Apply.STATUS_PASS ];

        if(target.userId){
            string +=   "and applyId in(select applyId from b_user_apply where userId =? and role = 1)";
            condition.push(target.userId);
        }

        if(target.applyId !=-1){
            string += "and applyId =? ";
            condition.push(target.applyId);
        }
        if(target.role !=-1){
            string += "and ua.role =? ";
            condition.push(target.role);
        }


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

    queryUsersByCondition : function (target ,callback){
        this.userDao.find(target , function (err , items){
            if(err){
                callback(err);
                return;
            }
            callback(null, items);
        });
    },

    add: function(target, callback){

        this.userDao.create(target , function (err , items){
            if(err){
                callback(err);
                return;
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

            for(key in target){
                user[key] = target[key];
            };
            user.save(function (err) {
                callback(err);
                // err.msg = "under-age";
            });
        });
    }
}


module.exports =  UserService;



