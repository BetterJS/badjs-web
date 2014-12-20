/**
 * Created by chriscai on 2014/12/16.
 */

var http = require('http');


var LogService = function (){
    this.url = 'http://183.60.70.234:9000/query';
}



LogService.prototype = {
    query : function (params , callback){

        var strParams = '';
        for(var key in params) {
            strParams += key +'='+ JSON.stringify(params[key] ) + '&';
        }
        strParams +='_=1';
        console.log('strParams:',strParams);
        http.get( this.url + '?'+ strParams , function (res){
            var buffer = '';
           res.on('data' , function (chunk){
               buffer += chunk.toString();
           }).on('end' , function (){
               try{
                    callback(null , JSON.parse(buffer))
               }catch(e){
                   callback(e );
               }
           })

        }).on('error' , function (err){
            callback(err)
        })
    }
}


module.exports =  LogService;

//new LogService().query({
//    id : 990,
//    startDate : 1417104000000,
//    endDate : 1417190400000,
//    include : [],
//    exclude : [],
//    page : 0,
//    level : [4]
//} , function (err , data){
//    console.log(data)
//    console.log('err' + err);
//});
