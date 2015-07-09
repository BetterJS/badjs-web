var  zmq = require('zmq')
    , client = zmq.socket('sub')
    , port = GLOBAL.pjconfig.zmq.url
    , service = GLOBAL.pjconfig.zmq.subscribe;

var events = require('events');

var _ = require("underscore");

var path = require("path");

var cluster = require('cluster');
cluster.setupMaster({
    exec: path.join(__dirname ,  "Worker.js")
});


var log4js = require('log4js'),
    logger = log4js.getLogger();

var Processor = function (){
    this.worker = cluster.fork({port : port , service :service });
    this.__pid__ = this.worker.process.pid;


    this.eventEmitter = new events.EventEmitter();
}


Processor.prototype = {

    start : function (obj){
        this.wbClient = obj.wbClient;
        this.id = 0;

        logger.info("processor("+this.__pid__+") start monitor");

        this.worker.send({type:"READY"});

        var self = this;
        var messageQueue = [];
        this.wbClient.on("message" , function (data){
            if(self.worker.state == "online"){
                // 新建一个worker 是有延迟的，  这个时候有message ,怎么加入队列，待其 OK 后在 send 给他
                if(messageQueue.length){
                    _.each(messageQueue , function (value){
                        self.worker.send(value);
                    });
                    messageQueue = [];
                }
                self.worker.send(JSON.parse(data));
            }else {
                messageQueue.push(JSON.parse(data));
            }

        });

        this.worker.on('message', function (data) {
            if(data.type == "_STOP_"){
                self.destroy();
            }else {
                self.wbClient && self.wbClient.send(JSON.stringify(data));
            }

        });

        this.wbClient.on("close" , function (data){
            self.destroy();
            self.worker.send({type : "STOP"});
        });
    },


    destroy : function (isKill){

        if(isKill){
            this.worker.kill();
            logger.info("processor("+this.__pid__+") killed " );
        }else {
            logger.info("processor("+this.__pid__+") stop monitor " );
        }

        this.wbClient = null;
        this.eventEmitter.emit("destroy");
    },

    on : function (key , cb){
        var self = this;
        this.eventEmitter.on(key , function (){
            cb.apply(self,arguments);
        })
    }
};

module.exports = Processor;