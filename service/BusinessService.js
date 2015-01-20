/**
 * Created by chriscai on 2014/12/17.
 */


var  Apply = require('../model/Apply');

var BusinessService = function (){

    this.db = global.models.db;
}


BusinessService.prototype = {

    findBusinessByUser : function (userName , callback){

        var string = "select ua.id, u.loginName, u.chineseName, ua.applyId, ua.role, a.name "+
            "from  b_user as u join b_user_apply as ua on(ua.userId = u.id) "+
            "join b_apply as a on (a.id =ua.applyId) "+
            "where  a.status=? and u.loginName=? ";
        var condition = [Apply.STATUS_PASS ];

        condition.push(userName);

        // console.log(string);
        this.db.driver.execQuery(string,condition, function (err, data) {
            if(err){
                callback(err);
                return;
            }
            callback(null, data);
        });

    }

}

module.exports = BusinessService;