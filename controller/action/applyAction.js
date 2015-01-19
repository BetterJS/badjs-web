/**
 * @info : APPLY ACION
 * @author : coverguo
 * @date : 2015-01-07
 */


var log4js = require('log4js'),
    logger = log4js.getLogger(),
    ApplyService = require('../../service/ApplyService'),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };



var applyAction = {

    addApply: function(params, res){
        //必要信息为空，则报错
        if(params.name == "" || params.url ==""){
            res.json({ret:1002, msg:"params error"});
            return;
        }
        var apply = params;
        apply.userName = params.user.loginName;
        apply.createTime = new Date();
        apply.status = 0;

        var applyService = new ApplyService();
        applyService.add(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, msg: "success-add"});
        });
    },
    queryListByUser : function (params,res) {
        var applyService = new ApplyService();
        applyService.queryListByUser(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, msg: "success", data:items});
        });
    },
    queryListBySearch : function (params,res) {
        var applyService = new ApplyService();
        applyService.queryListBySearch(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, msg: "success", data:items});
        });
    },
    update:function(params,cb){
        var as = new ApplyService();
        as.update(params,cb);
    },
    remove: function(){
        var as = new ApplyService();
        as.remove(params,cb);
    }

};

module.exports = applyAction;

