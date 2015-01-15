/**
 * Created by chriscai on 2014/12/17.
 */




var BussiessService = function (){

    this.approveDao = global.models.approveDao;
}


BussiessService.prototype = {

    findSercieByUser : function (username , callback){
        callback(null , [
            {id : 990 , name : '电影票 - 撒娇女人活动' },
            {id : 991 , name : 'mobile app' }
        ])
    }
}