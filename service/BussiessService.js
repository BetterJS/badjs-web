/**
 * Created by chriscai on 2014/12/17.
 */




var BussiessService = function (){
    this.url = 'http://183.60.70.234:9000/query';
}


BussiessService.prototype = {

    findSercieByUser : function (username , callback){
        callback(null , [
            {id : 990 , name : '电影票 - 撒娇女人活动' },
            {id : 991 , name : 'mobile app' }
        ])
    }
}