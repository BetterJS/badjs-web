/**
 * Created by coverguo on 2015/1/12.
 */

var  log4js = require('log4js'),
    logger = log4js.getLogger(),
    UserService = require('../../service/UserService');



var userAction = {

    addApply: function(params, cb){
        var us = new UserService();
        us.add(params,cb);
    },
    queryList : function (params,cb) {
        var us = new UserService();
        us.query(params,cb);
    },
    update:function(){
        var us = new UserService();
        us.update(params,cb);
    },
    remove: function(){
        var us = new UserService();
        us.remove(params,cb);

    }

};

module.exports = userAction;

