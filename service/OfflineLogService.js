/**
 * Created by chriscai on 2015/4/29.
 */

var fs = require("fs");
var http = require("http");
var path = require("path");
var bodyParser = require('body-parser');
var express = require('express');
var app = express();

global.offlineAutoInfo = {}

var log4js = require('log4js'),
    logger = log4js.getLogger();

app.use(bodyParser.urlencoded({ extended: false }));


app.post("/offlineLogReport" , function (req, res){
    var param = req.body;
    if(param && param.offline_log){
        try{
            var offline_log = JSON.parse(param.offline_log);
            if(!/[\w]{1,7}/.test(offline_log.id)){
                throw new Error("invalid id " + offline_log.id)
            }
            var filePath = path.join(__dirname , '..'  , 'offline_log' , offline_log.id +"");
            var fileName = offline_log.uin + "_" + (new Date-0);
            if(!fs.existsSync(filePath)){
                fs.mkdirSync(filePath)
            }
            fs.writeFile( path.join(filePath , fileName ) , param.offline_log)

            logger.info('get offline log : ' + path.join(filePath , fileName ));
        }catch(e){
            logger.warn(e);
        }
    }

    res.end();
})

app.use("/offlineLogCheck" , function (req, res){

    var param = req.query;
    if(param.id && param.uin && global.offlineAutoInfo[param.id + "_" + param.uin]){
        logger.info('reponse auto offline auto  : ' + (param.id + "_" + param.uin));
        res.end("true")
    }else {
        res.end("false")
    }
})



/**
 * dispatcher
 * @returns {Stream}
 */
module.exports = function () {

    logger.info("offline service start ok...")
    app.listen(9010);

};
