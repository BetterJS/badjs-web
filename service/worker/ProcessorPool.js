
var Processor = require("./Processor");
var _ = require("underscore");


var log4js = require('log4js'),
    logger = log4js.getLogger();


var STATUS_IDLE = "IDLE";
var STATUS_RUNNING = "RUNNING";
var ROLE_NEW = "NEW";
var ROLE_NOMRAL = "NOMRAL";

// 半个小时，回收新增的线程
var IDLE_TIMEOUT = 1800000;


var ProcessorPool = function (){

    var currentId = 0;
    var idlePool = [];
    var runningPool = [];
    var processorMapping = {};


    var init = function (){
        monitorError();
        recovery();
    }


    /* private */
    var createProcessor = function (obj){
        var p = {id : currentId++ , processor : new Processor() , status : obj.status || STATUS_IDLE , role : obj.role , idleTime : 0 };
        p.processor.__id__ = p.id;
        processorMapping[p.id] = p;
        bindProcessorEvent(p);

        return p;
    }

    var bindProcessorEvent = function (p){
        p.processor.on("destroy" , function (){
            ProcessorPool.destroy(this);
        })
    }

    var monitorError = function (){
        process.on("exit" , function (){
            _.each(runningPool , function (value){
                value.destroy(true);
            });

            _.each(idlePool , function (value){
                value.destroy(true);
            });
        })
    }

    var idleProcessor = function (p){
        var processor = processorMapping[p.__id__];
        if(processor.status == STATUS_IDLE){
            return ;
        }else {
            var index = 0;
            for(var i = 0 ; i < runningPool.length ; i ++){
                if(runningPool[i].id == p.__id__){
                    index = i;
                    break;
                }
            }
            processor.status = STATUS_IDLE;
            processor.idleTime = new Date - 0;
            idlePool.push(runningPool.splice(index , 1)[0]);

            logger.debug("idleProcessor id="+ p.__id__ + ", idle count: " + ProcessorPool.idleProcessors() +", running count: " + ProcessorPool.runningProcessors());
        }
    }

    var recovery = function (){
        setInterval(function (){
            var newIdlePool = [];
            _.each(idlePool , function (value){
                if(value.role == ROLE_NEW && (new Date - value.idleTime) > IDLE_TIMEOUT ){
                    value.processor.destroy(true);

                    logger.info("processor("+value.processor.__pid__+") idle timeout and clear");
                }else {
                    newIdlePool.push(value)
                }
            });
            idlePool = newIdlePool;

        },900000);
    }

    ProcessorPool.createPool = function (number){
        var max = number || 15;
        for(var i= 0 ; i <max ; i ++) {
            idlePool.push(createProcessor({role:ROLE_NOMRAL}));
        }

        logger.info("create ProcessPool , number : " + number)
        monitorError();
    }

    ProcessorPool.getProcessor = function (){
        var p;
        if(idlePool.length <=0 ){
            p = createProcessor({status : STATUS_RUNNING , role : ROLE_NEW });
        }else {
            p = idlePool.splice(0,1)[0];
        }

        p.status = STATUS_RUNNING;
        runningPool.push(p);

        logger.debug("runningProcessor id="+ p.processor.__id__ + ", idle count: " + ProcessorPool.idleProcessors() +", running count: " + ProcessorPool.runningProcessors());
        return p.processor;
    }


    /**
     * destroy processor
     * @param p
     */
    ProcessorPool.destroy = function (p){
        idleProcessor(p);
    }


    /**
     * return number of processor
     * @returns {number}
     */
    ProcessorPool.totalProcessors = function (){
        return runningPool.length + idlePool.length;
    }

    /**
     * return number of running processor
     * @returns {Number}
     */
    ProcessorPool.runningProcessors = function (){
        return runningPool.length;
    }

    /**
     * return number of idle processor
     */
    ProcessorPool.idleProcessors = function (){
        return idlePool.length;
    }


    init();

    return ProcessorPool;
}


module.exports = ProcessorPool();