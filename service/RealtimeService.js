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

    });

    webSocketServer.on('close', function (ws) {
        try{
            logger.info("one client closed , ip: " + ws._socket.remoteAddress)
        }catch(e){}
    });



};