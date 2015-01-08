/**
 * @info : APPLY ACION
 * @author : coverguo
 * @date : 2015-01-07
 */


var  log4js = require('log4js'),
    logger = log4js.getLogger();
var applyDao = global.models.applyDao;

var applyAction = {

    addApply: function(params, cb){
        var ls = new LogService();
        ls.query(params,cb);
    },
    queryList : function (params,cb) {
    },
    update:function(){
    },
    delete: function(){

    }

};

module.exports = applyAction;

