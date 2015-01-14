/**
 * @info : APPROVE ACION
 * @author : coverguo
 * @date : 2015-01-12
 */


var  log4js = require('log4js'),
    logger = log4js.getLogger(),
    ApproveService = require('../../service/ApproveService');



var approveAction = {

    addApprove: function(params, cb){
        var as = new ApproveService();
        as.add(params,cb);
    },
    queryList : function (params,cb) {
        var as = new ApproveService();
        as.query(params,cb);
    },
    update:function(){
        var as = new ApproveService();
        as.update(params,cb);
    },
    remove: function(){
        var as = new ApproveService();
        as.remove(params,cb);

    }

};

module.exports = approveAction;

