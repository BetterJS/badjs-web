/**
 * @info : APPROVE ACION
 * @author : coverguo
 * @date : 2015-01-12
 */


var  log4js = require('log4js'),
    logger = log4js.getLogger(),
    ApproveService = require('../../service/ApproveService');



var approveAction = {

   doApprove: function(params, req , res){
        var approve = params;
        approve.createTime = new Date();
        approve.userName = params.user.loginName;
        logger.debug('add_approve param :' + approve);
        var approveService = new ApproveService();
        approveService.add(params, function (err, items) {
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, msg:"审核完成"});
        });
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

