/**
 * Created by chriscai on 2014/12/16.
 */

var http = require('http');

var  log4js = require('log4js'),
    logger = log4js.getLogger();



var LogService = function (){

    if(GLOBAL.DEBUG){
        this.url = 'http://localhost:9000/query';
    }else {
        this.url = 'http://10.143.132.205:9000/query';
    }

    logger.debug('query url : ' + this.url)
//    this.url = 'http://127.0.0.1:9000/query';
}



LogService.prototype = {
    query : function (params , callback){

        var strParams = '';
        for(var key in params) {
            if(key == 'index'){
                strParams += key +'='+ params[key]  + '&';
            }else {
                strParams += key +'='+ JSON.stringify(params[key] ) + '&';

            }
        }
        strParams +='_=1';
        logger.debug('query param : ' +strParams );
        http.get( this.url + '?'+ strParams , function (res){
            var buffer = '';
           res.on('data' , function (chunk){
               buffer += chunk.toString();
           }).on('end' , function (){
               try{
                    callback(null , JSON.parse(buffer))
               }catch(e){
                   callback(e);
               }
           })

        }).on('error' , function (err){
            logger.warn('error :' + err);
            callback(err)
        })
    }
}


module.exports =  LogService;

