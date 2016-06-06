/**
 * Created by chriscai on 2015/4/29.
 */

var ProcessorThread = require("../service/worker/ProcessorPool");


var WebSocketServer = require('ws').Server;

var http = require("http");

var path = require("path");


var log4js = require('log4js'),
    logger = log4js.getLogger();



/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function (app) {


    logger.info("starting mq ..." );


    var server = http.createServer(app);
    app.listen = function(){
        return server.listen.apply(server, arguments)
    };
    var webSocketServer = new WebSocketServer({
        server: server,
        path: "/ws/realtimeLog"
    });


    ProcessorThread.createPool();

    webSocketServer.on('connection', function (ws) {
        try{
            logger.info("one client connected , ip: " + ws._socket.remoteAddress)
        }catch(e){}
        createProcessor(ws);
    });

    webSocketServer.on('close', function (ws) {
        try{
            logger.info("one client closed , ip: " + ws._socket.remoteAddress)
        }catch(e){}
    });


    var createProcessor = function (ws){
        ProcessorThread.getProcessor().start({wbClient : ws});
    }

};
