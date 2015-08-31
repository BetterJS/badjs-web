/**
 * @info : APPROVE ACION
 * @author : coverguo
 * @date : 2015-01-12
 */


var log4js = require('log4js'),
    logger = log4js.getLogger(),
    ApproveService = require('../../service/ApproveService'),
    LogService = require('../../service/LogService'),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };




var approveAction = {

   doApprove: function(params, req , res){
        var approve = params;
        approve.createTime = new Date();
        approve.userName = params.user.loginName;
        logger.debug('add_approve param :' + approve);
        var approveService = new ApproveService();
        var logService = new LogService();
        approveService.add(params, function (err, items) {
            if(isError(res, err)){
                return;
            }



            if(params.applyStatus == 1 || params.applyStatus == 2){
                var pushProject = function (){
                    logService.pushProject(function (err){
                        if(err){
                            logger.warn('push project  error ' + err);
                        }else {
                            logger.info('push project success from approve ');
                        }
                    });
                }
                pushProject();
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
    remove: function(params , cb){
        var as = new ApproveService();
        as.remove(params,cb);

    }

};

module.exports = approveAction;

