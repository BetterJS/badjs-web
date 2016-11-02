/**
 * Created by chriscai on 2014/12/17.
 */


var Apply = require('../model/Apply');
var _ = require('underscore');

var BusinessService = function() {

    this.db = global.models.db;
};


BusinessService.prototype = {

    findBusinessByUser: function(userName, callback) {

        var string = "select a.id, u.loginName, u.chineseName, ua.role, a.name " +
            "from  b_user as u join b_user_apply as ua on(ua.userId = u.id) " +
            "join b_apply as a on (a.id =ua.applyId) " +
            "where  a.status=? and u.loginName=? ";
        var condition = [Apply.STATUS_PASS];

        condition.push(userName);

        // console.log(string);
        this.db.driver.execQuery(string, condition, function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, data);
        });

    },
    findBusinessByProjectOwner: function(userName, callback) {

        var string = "select a.id, u.loginName, u.chineseName, ua.role, a.name " +
            "from  b_user as u join b_user_apply as ua on(ua.userId = u.id) " +
            "join b_apply as a on (a.id =ua.applyId) " +
            "where  a.status=? and u.loginName=?  and ua.role =1";
        var condition = [Apply.STATUS_PASS];

        condition.push(userName);

        // console.log(string);
        this.db.driver.execQuery(string, condition, function(err, data) {
            if (err) {
                callback(err);
                return;
            }
            callback(null, data);
        });

    },

    findBusiness: function(callback) {

        var string = "select a.id, a.url, a.blacklist , a.appkey, u.loginName, u.chineseName, a.name " +
            "from b_apply a join b_user u on (a.userName=u.loginName) " +
            "where a.status=?";
        var condition = [Apply.STATUS_PASS];

        // console.log(string);
        this.db.driver.execQuery(string, condition, function(err, data) {
            if (err) {
                return callback(err);
            }

            _.each(data, function(value, ke) {
                value.role = 1;
            });
            callback(null, data);
        });

    }

};

module.exports = BusinessService;
