/**
 * Created by chriscai on 2014/12/16.
 */

var http = require('http');

var log4js = require('log4js'),
    BusinessService = require('./BusinessService'),
    _ = require('underscore'),
    logger = log4js.getLogger();

var request = require("request");



var LogService = function (){

   /* if(GLOBAL.DEBUG){
        this.queryUrl = 'http://localhost:9000/query';
    }else {
        this.queryUrl = 'http://10.143.132.205:9000/query';
        this.pushProjectUrl = 'http://10.143.132.205:9001/getProjects';
    //}*/

    this.queryUrl = GLOBAL.pjconfig.storage.queryUrl;
    this.pushProjectUrl = GLOBAL.pjconfig.acceptor.pushProjectUrl;
    this.pushProjectUrl2 = GLOBAL.pjconfig.openapi.pushProjectUrl;

    logger.debug('query url : ' + this.queryUrl)
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
        http.get( this.queryUrl + '?'+ strParams , function (res){
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
    },
    pushProject : function (callback){
        var self = this;

        callback || (callback = function (){});

        var businessService   = new BusinessService();

        var push = function (){

            businessService.findBusiness(function (err , item){

                var strParams = '';

                _.each( item , function (value , ke){
                    strParams+=value.id+"|"+value.appkey+"_";
                });

                if(strParams.length >0){
                    strParams = strParams.substring(0 , strParams.length-1  ) ;
                }

                //strParams +="auth=badjsAccepter";

                var result = [0,0]
                // todo fix ? post is async
                var resultCall = function (){
                    if(result[0] < 0 && result[1] <0){
                        callback(new Error("error"))
                    }else if(result[0] > 0 && result[1] > 0) {
                        callback()
                    }
                }

                request.post(self.pushProjectUrl , {form:{projectsId : strParams, auth : "badjsAccepter"}} , function (err ){
                    if(err){
                        logger.warn('push projectIds to acceptor  error :' + err);
                        result[0] = -1
                    }else {
                        logger.info('push projectIds to acceptor  success');
                        result[0] = 1;
                    }
                    resultCall();
                });

                request.post(self.pushProjectUrl2 , {form:{projectsId : strParams , auth : "badjsOpen"}}  , function (err ){
                    if(err){
                        logger.warn('push projectIds to open  error :' + err);
                        result[1] = -1;
                    }else {
                        logger.info('push projectIds to openapi success');
                        result[1] = 1;
                    }
                    resultCall();
                });

            });
        }

        push();

    }
}


module.exports =  LogService;

