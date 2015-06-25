/**
 * @info : LOG ACION
 * @author : coverguo
 * @date : 2014-12-16
 */

var LogService = require('../../service/LogService'),
    log4js = require('log4js'),
    http = require('http'),
    logger = log4js.getLogger(),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };

var LogAction = {
    queryLogList : function (params, req , res) {

        var logService = new LogService();

        params['endDate'] -=0;
        params['startDate'] -=0;
        params['id'] -=0;
        delete params.user;
        logService.query(params,function(err, items){
            if(isError(res, err)){
                return;
            };

            res.json({ret:0, msg:"success-query", data:items });
        });
    },

    code : function (params, req , res){
        http.get(params.target  , function(response){
            var buffer = '';
            response.on('data' , function (chunk){
                buffer += chunk.toString();
            }).on('end' , function (){
                res.json({ret:0, msg:"success-query", data:buffer});
            });
        })
    }
};

module.exports = LogAction;

