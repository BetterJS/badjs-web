/* global global */
/**
 * Created by chriscai on 2014/12/16.
 */

var http = require('http');

var log4js = require('log4js'),
    BusinessService = require('./BusinessService'),
    _ = require('underscore'),
    logger = log4js.getLogger();

var request = require("request");



var LogService = function() {

    /*
        if(global.DEBUG){
            this.queryUrl = 'http://localhost:9000/query';
        }else {
            this.queryUrl = 'http://10.143.132.205:9000/query';
            this.pushProjectUrl = 'http://10.143.132.205:9001/getProjects';
        }
    */

    this.queryUrl = global.pjconfig.storage.queryUrl;
    this.pushProjectUrl = global.pjconfig.acceptor.pushProjectUrl;
    this.pushProjectUrl2 = global.pjconfig.openapi.pushProjectUrl;

    // this.url = 'http://127.0.0.1:9000/query';
    logger.debug('query url : ' + this.queryUrl);
};



LogService.prototype = {
    query: function(params, callback) {
        var startDate = new Date;
        var strParams = '';
        for (var key in params) {
            if (key == 'index') {
                strParams += key + "=" + params[key] + "&";
            } else {
                strParams += key + "=" + encodeURIComponent(JSON.stringify(params[key])) + "&";
            }
        }
        strParams += '_=1';
        logger.debug('query param : ' + strParams);
        http.get(this.queryUrl + '?' + strParams, function(res) {
            var buffer = '';
            res.on('data', function(chunk) {
                buffer += chunk.toString();
            }).on('end', function() {
                try {
                    callback(null, JSON.parse(buffer));
                } catch (e) {
                    callback(e);
                }
                logger.info('query log spend : ' + (new Date - startDate) + "ms by " + params.id);
            });

        }).on('error', function(err) {
            logger.warn('error :' + err);
            callback(err);
        });
    },
    pushProject: function(callback) {
        var self = this;

        callback || (callback = function() {});

        var businessService = new BusinessService();

        var push = function() {

            businessService.findBusiness(function(err, item) {

                var projectsInfo = {};

                _.each(item, function(value) {

                    try{
                        value.blacklist =  JSON.parse(value.blacklist || {})
                    }catch(e){
                        value.blacklist = {}
                    }

                    projectsInfo[value.id] = {id : value.id , url : value.url , blacklist : value.blacklist , appkey : value.appkey};
                });

                var result = [0, 0];

                var resultCall = function() {
                    if (result[0] < 0 && result[1] < 0) {
                        callback(new Error("error"));
                    } else if (result[0] > 0 && result[1] > 0) {
                        callback();
                    }
                };

                request.post(self.pushProjectUrl, {
                    form: {
                        projectsInfo: JSON.stringify(projectsInfo),
                        auth: "badjsAccepter"
                    }
                }, function(err) {
                    if (err) {
                        logger.warn('push projectIds to acceptor  error :' + err);
                        result[0] = -1;
                    } else {
                        logger.info('push projectIds to acceptor  success');
                        result[0] = 1;
                    }
                    resultCall();
                });

                request.post(self.pushProjectUrl2, {
                    form: {
                        projectsInfo: JSON.stringify(projectsInfo),
                        auth: "badjsOpen"
                    }
                }, function(err) {
                    if (err) {
                        logger.warn('push projectIds to open  error :' + err);
                        result[1] = -1;
                    } else {
                        logger.info('push projectIds to openapi success');
                        result[1] = 1;
                    }
                    resultCall();
                });

            });
        };

        push();

    }
};


module.exports = LogService;
