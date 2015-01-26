/**
 * Created by chriscai on 2014/12/16.
 */

var http = require('http');

var log4js = require('log4js'),
    BusinessService = require('./BusinessService'),
    _ = require('underscore'),
    logger = log4js.getLogger();



var LogService = function (){

    if(GLOBAL.DEBUG){
        this.queryUrl = 'http://localhost:9000/query';
    }else {
        this.queryUrl = 'http://10.143.132.205:9000/query';
        this.pushProjectUrl = 'http://10.143.132.205:9001/getProjects';
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

        businessService.findBusiness(function (err , item){

            var strParams = '';

            _.each( item , function (value , ke){
                strParams+=value.id+"_";
            });

            if(strParams.length >0){
                strParams = "projectsId="+strParams.substring(0 , strParams.length-1   ) + "&";
            }

            strParams +="auth=badjsAccepter";


            http.get( self.pushProjectUrl + '?' + strParams , function (res){
                var buffer = '';
                res.on('end' , function (){
                    callback();
                })

            }).on('error' , function (err){
                logger.warn('push project error :' + err);
                callback(err)
            })
        });


    }
}


module.exports =  LogService;

