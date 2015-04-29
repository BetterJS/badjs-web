/**
 * Created by chriscai on 2015/4/29.
 */


var pjconfig = require('../project.json');

var  zmq = require('zmq')
    , client = zmq.socket('sub')
    , port = pjconfig.zmq.url
    , service = pjconfig.zmq.subscribe;


var http = require("http");




    logger.info("starting zmq : " + service);

    client.connect(port);
    client.subscribe(service);




    client.on('message', function (data) {
        console.log(data.toString());
    });

