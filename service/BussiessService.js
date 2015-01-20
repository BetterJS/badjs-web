/**
 * Created by chriscai on 2014/12/17.
 */


var  Apply = require('../model/Apply');

var BussiessService = function (){

    this.approveDao = global.models.approveDao;
    this.applyDao = global.models.applyDao;
}


BussiessService.prototype = {

    findBussiessByUser : function (username , callback){

        this.applyDao.find({status: Apply.STATUS_PASS , userName: username} , function (err , item){

            callback(err , item);

        })

    }

}

module.exports = BussiessService;