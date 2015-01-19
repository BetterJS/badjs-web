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
    addUserApply: function(userApply, res){

        userApply.createTime = new Date();
        var userApplyService = new UserApplyService();
        userApplyService.add(userApply,function(err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({ret: 0, msg: "success-add"});
        });
    },


    update:function(req, res){

    },
    remove: function(){


    }

};

module.exports = userAction;

