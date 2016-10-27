var  mq = require(global.pjconfig.mq.module)
    , client = mq.socket('sub')
    , mqUrl = global.pjconfig.mq.url
    , service = global.pjconfig.mq.subscribe;


var log4js = require('log4js'),
    logger = log4js.getLogger();

var events = require('events');

var _ = require("underscore");

var path = require("path");

var cluster = require('cluster');
cluster.setupMaster({
    exec: path.join(__dirname ,  "Worker.js")
});

var support_signal = false;



var log4js = require('log4js'),
    logger = log4js.getLogger();

var Processor = function (){
    this.worker = cluster.fork({mqUrl : mqUrl , service :service , debug :  !!global.DEBUG , mqModule : global.pjconfig.mq.module });
    this.__pid__ = this.worker.process.pid;


    this.eventEmitter = new events.EventEmitter();
}


Processor.prototype = {

    start : function (obj){
        this.wbClient = obj.wbClient;
        this.id = 0;

        logger.info("processor("+this.__pid__+") start monitor");


        var self = this;
        var messageQueue = [{type:"READY"}];
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
                try{
                self.wbClient && self.wbClient.send(JSON.stringify(data));
                }catch(e){
                    logger.info("one client had closed");
                    self.destroy();
                }
            }

        });

        this.wbClient.on("close" , function (data){
            self.worker.send({type : "STOP"});
            self.destroy();
        });
    },

    isDead : function (){
        if(!this.worker){
            return true;
        }
        return this.worker.isDead();
    },


    destroy : function (isKill){
        if(isKill){
            this.worker.kill();
            logger.info("processor("+this.__pid__+") killed " );
        }else {
            logger.info("processor("+this.__pid__+") stop monitor " );
        }
        this.worker.removeAllListeners();
        this.wbClient = null;
        this.eventEmitter.emit("destroy");
    },

    wait : function (){
        support_signal && this.worker.kill("SIGSTOP");
    },

    notify : function (){
        support_signal && this.worker.kill("SIGCONT");
    },

    on : function (key , cb){
        var self = this;
        this.eventEmitter.on(key , function (){
            cb.apply(self,arguments);
        })
    }
};

module.exports = Processor;
