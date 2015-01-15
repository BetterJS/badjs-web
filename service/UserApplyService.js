/**
 * Created by coverguo on 2015/01/15.
 */

var http = require('http'),
    log4js = require('log4js'),
    logger = log4js.getLogger();



var ApproveService = function (){
    this.approveDao = global.models.approveDao;

};



ApproveService.prototype = {
    query : function (target , callback){


    },
    add: function(target, callback){


    },
    remove : function(target, callback){

    },
    update : function(target, callback){

    }
}


module.exports =  ApproveService;

