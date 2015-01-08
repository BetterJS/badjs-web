/**
 * Created by coverguo on 2015/01/08.
 */

var http = require('http');

var  log4js = require('log4js'),
    logger = log4js.getLogger();

var applyDao = GLOBAL.models.applyDao;

var ApplyService = function (){


}



ApplyService.prototype = {
    query : function (target , callback){
        applyDao.find(target , function (err , items){
            if(err){
                callback(err);
            }
            callback(null,items)
        });
    },
    add: function(targer, callback){

        applyDao.create(targer , function (err , items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, data: {msg:"SUCCESS"}});
        });
    },
    remove : function(target, callback){

    },
    update : function(target, callback){
        applyDao.find({id: target.id }, function (err, apply) {
            // SQL: "SELECT * FROM b_apply WHERE name = 'xxxx'"
            params[0].each(function(key, value){
                apply[key] = value;
            })
            apply[0].save(function (err) {
                // err.msg = "under-age";
            });
        });
    }
}


module.exports =  LogService;

