/**
 * @info : LOG ACION
 * @author : coverguo
 * @date : 2014-12-16
 */

var LogService = require('../../service/LogService');

var LogAction = {

    getLogList : function (params,cb) {
        console.log('action-parmas：', params);
        for(var key in params){
            if(key == 'level'){
                for(var i= 0, len= params[key].length; i<len; i++){
                    params[key][i] -= 0;
                }
            }
            params['endDate'] -=0;
            params['startDate'] -=0;
            params['id'] -=0;

        }
        var ls = new LogService();
        ls.query(params,cb);
    }
};

module.exports = LogAction;

