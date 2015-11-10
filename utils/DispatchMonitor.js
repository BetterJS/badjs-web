var zmq = require('zmq'),
    client = zmq.socket('sub'),
    port = "tcp://10.143.132.205:10000",
    service = "badjs";

var spawn = require("child_process").spawn;

var badjsKey = "635658";

var path = "/usr/local/agenttools/agent/agentRepSum";

client.connect(port);
client.subscribe(service);

var total = 0;

client.on("message", function(data) {
    var dataStr = data.toString();
    data = dataStr.substring(dataStr.indexOf(' '));
    try {
        data = JSON.parse(data);
    } catch (e) {}


    if (data.mmid) {

    }

    total++;

});

// 一个小时上报一次
setInterval(function() {
    spawn(path, [badjsKey, total]);
    total = 0;
}, 3600000);