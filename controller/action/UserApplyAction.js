/**
 * Created by coverguo on 2015/1/12.
 */

var log4js = require('log4js'),
    logger = log4js.getLogger(),
    UserApplyService = require('../../service/UserApplyService'),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };


var userAction = {
    addUserApply: function(userApply, req , res){

        if(userApply.userName ==""){
            res.json({ret: 1002, msg: "userName为空"});
            return;
        }
        userApply.createTime = new Date();
        var userApplyService = new UserApplyService();
        userApplyService.add(userApply,function(err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({ret: 0, msg: "success-add"});
        });
    },


    //update:function(req, res){
    //
    //},
    remove: function(remove, req, res){
        if(remove.id ==""){
            res.json({ret: 1002, msg: "id为空"});
            return;
        }
        var userApplyService = new UserApplyService();
        userApplyService.remove(remove,function(err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({ret: 0, msg: "success-remove"});
        });

    },

    auth: function(auth, req, res){
        if(auth.id ==""){
            res.json({ret: 1002, msg: "id为空"});
            return;
        }
        var userApplyService = new UserApplyService();
        userApplyService.auth(auth,function(err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({ret: 0, msg: "success-update"});
        });

    }

};

module.exports = userAction;

