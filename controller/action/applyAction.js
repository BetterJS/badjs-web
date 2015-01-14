/**
 * @info : APPLY ACION
 * @author : coverguo
 * @date : 2015-01-07
 */


var  log4js = require('log4js'),
     logger = log4js.getLogger(),
     ApplyService = require('../../service/ApplyService');



var applyAction = {

    addApply: function(params, cb){
        var as = new ApplyService();
        as.add(params,cb);
    },
    queryList : function (params,cb) {
        var as = new ApplyService();
        as.query(params,cb);
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

