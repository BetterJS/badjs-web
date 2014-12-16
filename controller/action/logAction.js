/**
 * @info : LOG ACION
 * @author : coverguo
 * @date : 2014-12-16
 */

var LogService = require('../../service/LogService');

var LogAction = {
    getLogList : function (params,cb) {
        for(var key in params){
            if(key == 'level'){
                for(var i= 0, len= params[key].length; i<len; i++){
                    params[key][i] -= 0;
                }
            }
            else{
                params[key] -= 0;
            }

        }
        var ls = new LogService();
        ls.query(params,cb);
    }
};

module.exports = LogAction;

