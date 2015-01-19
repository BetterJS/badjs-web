/**
 * Created by coverguo on 2015/1/12.
 */

var log4js = require('log4js'),
    logger = log4js.getLogger(),
    UserService = require('../../service/UserService'),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };


var userAction = {

    addUser: function(params, cb){
        var us = new UserService();
        us.add(params,cb);
    },
    queryListByProject : function (params, res) {

        var userService = new UserService();
        //用户根据项目查询项目成员
        userService.queryListByProject(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, data:items, msg:"success"});
        });
    },

    update:function(req, res){

    },
    remove: function(){


    }

};

module.exports = userAction;

