

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
            this._msgCallback = cb;
        }

    }
}


var processor = ProcessorThread.getProcessor();

processor.start({wbClient : webclientMock});



/*setInterval(function (){
    webclientMock._msgCallback(JSON.stringify({type : "KEEPALIVE"}));
},2000);*/

setTimeout(function (){
    webclientMock._msgCallback(JSON.stringify({type : "INIT" , id:5}));
},1000)

/*setTimeout(function (){
    processor.destroy();
},10000)*/


