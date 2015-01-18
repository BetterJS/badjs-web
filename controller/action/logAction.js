/**
 * @info : LOG ACION
 * @author : coverguo
 * @date : 2014-12-16
 */

var LogService = require('../../service/LogService'),
    log4js = require('log4js'),
    logger = log4js.getLogger(),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };

var LogAction = {
    queryLogList : function (params,res) {

        var logService = new LogService();

        for(var key in params){
            params['endDate'] -=0;
            params['startDate'] -=0;
            params['id'] -=0;
        }
        logService.query(params,function(err, items){
            if(isError(res, err)){
                return;
            };
            res.json({ret:0, msg:"success-query", data:items});
        });
    }
};

module.exports = LogAction;

