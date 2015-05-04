/**
 * Created by chriscai on 2015/4/29.
 */
var  zmq = require('zmq')
    , client = zmq.socket('sub')
    , port = GLOBAL.pjconfig.zmq.url
    , service = GLOBAL.pjconfig.zmq.subscribe;

var WebSocketServer = require('ws').Server;

var http = require("http");


var log4js = require('log4js'),
    logger = log4js.getLogger();




/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function (app) {

    logger.info("starting zmq : " + service);

    client.connect(port);
    client.subscribe(service);


    var server = http.createServer(app);
    app.listen = function(){
        return server.listen.apply(server, arguments)
    };
    var webSocketServer = new WebSocketServer({
        server: server,
        path: "/ws/realtimeLog"
    });
    webSocketServer.broadcast = function broadcast(data) {
        webSocketServer.clients.forEach(function each(client) {
            client.send(data);
        });
    };


    client.on('message', function (data) {
        var dataStr = data.toString();
        data = dataStr.substring(dataStr.indexOf(' '));
        webSocketServer.broadcast(data);

    });



    webSocketServer.on('connection', function (ws) {
        try{
            logger.info("one client connected , ip: " + ws._socket.remoteAddress)
        }catch(e){}
        monitorClientTimeout(ws);
    });

    webSocketServer.on('close', function (ws) {
        try{
            logger.info("one client closed , ip: " + ws._socket.remoteAddress)
        }catch(e){}

    });



    var resetTimeoutFlag = function (ws){
        ws._keepalive = new Date - 0 ;
        ws._timeoutTimes = 0;
    }



    var monitorClientTimeout = function (ws){
        resetTimeoutFlag(ws);

        ws.on('message' , function (data , flag){
            logger.debug("get keepalive message : " + data);
            if(data == "__keepalive__"){
                resetTimeoutFlag(this);
            }
        })
    }


    // monitor client is closed
    setInterval(function (){
        var currentDate = new Date - 0;
        webSocketServer.clients.forEach(function each(client) {
            if(!client._keepalive){
                resetTimeoutFlag(client);
            }
            if (currentDate - client._keepalive  > 5000) {
                client._timeoutTimes++;
            }

            if(client._timeoutTimes >2){
                client.close();
                logger.info("one client timeout , ip: " + client._socket.remoteAddress);
            }
        });
    },5000);

};