
var EventEmitter = require("events");

var eventEmitter = new EventEmitter;

GLOBAL= {
    pjconfig : {
        zmq : {
            "url" : "tcp://127.0.0.1:10000",
            "subscribe" : "badjs"
        }
    }
}


var ProcessorThread = require("../service/worker/ProcessorPool");




ProcessorThread.createPool(1);



var webclientMock = {
    _msgCallback :null,
    send: function (data ){
        console.log(data);
    },
    close : function (){

    },
    on : function (msg , cb){
        if(msg == "message"){
            eventEmitter.on("test" , cb)
        }

    }
}


ProcessorThread.getProcessor().start({wbClient : webclientMock});
ProcessorThread.getProcessor().start({wbClient : webclientMock});
ProcessorThread.getProcessor().start({wbClient : webclientMock});

setTimeout(function (){
    eventEmitter.emit("test", JSON.stringify({type : "INIT" , id:5}))

},1000)



