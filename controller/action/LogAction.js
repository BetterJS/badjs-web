/**
 * @info : LOG ACION
 * @author : coverguo
 * @date : 2014-12-16
 */

var LogService = require('../../service/LogService'),
    log4js = require('log4js'),
    http = require('http'),
    logger = log4js.getLogger(),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };

var fs = require("fs")
var path = require("path")

var LogAction = {
    queryLogList : function (params, req , res) {

        var logService = new LogService();

        params['endDate'] -=0;
        params['startDate'] -=0;
        params['id'] -=0;
        delete params.user;
        logService.query(params,function(err, items){
            if(isError(res, err)){
                return;
            };

            res.json({ret:0, msg:"success-query", data:items });
        });
    },
    showOfflineFiles : function (params, req , res) {

        if(!params.id){
            res.json({ret:0, msg:"success-query", data:[] });
            return
        }

        var filePath = path.join(__dirname , '..' , '..'  , 'offline_log' , params.id +"");


        if(!fs.existsSync(filePath)){
            res.json({ret:0, msg:"success-query", data:[] });
            return
        }


        var offlineFiles = fs.readdirSync(filePath);
        var offlineFilesList = [];
        offlineFiles.sort(function (a, b){
            if(a < b ){
                return 1;
            }else {
                return -1;
            }
        })

        offlineFiles = offlineFiles.slice(0,50);

        offlineFiles.forEach(function (item){
            offlineFilesList.push({
                id : item
            })
        })

        res.json({ret:0, msg:"success-query", data:offlineFilesList });


    },

    showOfflineLog : function (params, req , res) {

        if(!params.fileId || !params.id){
            res.json({ret:0, msg:"success-query", data:[] });
            return
        }

        var filePath = path.join(__dirname , '..' , '..'  , 'offline_log' ,params.id +"" , params.fileId);


        if(!fs.existsSync(filePath)){
            res.json({ret:0, msg:"success-query", data:[] });
            return
        }


        var offlineFiles = fs.readFileSync(filePath);

        res.json({ret:0, msg:"success-query", data:offlineFiles.toString() });


    },

    deleteOfflineLogConfig : function (params, req , res){
        if(!params.id ||  !params.uin ){
            res.json({ret:0, msg:"", data:{} });
            return
        }


        if (global.offlineLogMonitorInfo[params.id] && global.offlineLogMonitorInfo[params.id][params.uin] ){
            delete global.offlineLogMonitorInfo[params.id][params.uin]
        }

        res.json({ret:0, msg:"", data:{} });
    },

    getOfflineLogConfig : function (params, req , res){
        if(!params.id ){
            res.json({ret:0, msg:"", data:{}});
            return
        }

        var result = {};
        if (global.offlineLogMonitorInfo[params.id]  ){
            result = global.offlineLogMonitorInfo[params.id];
        }

        res.json({ret:0, msg:"", data:result});
    },

    addOfflineLogConfig : function (params, req , res){
        if(!params.id || !params.uin){
            res.json({ret:-1, msg:"", data:{} });
            return
        }

        if(!global.offlineLogMonitorInfo[params.id]){
            global.offlineLogMonitorInfo[params.id] = {}
        }

        var hadAdd = false;
        if(!global.offlineLogMonitorInfo[params.id][params.uin]){
            global.offlineLogMonitorInfo[params.id][params.uin] = true;
        }else {
            hadAdd = true;
        }


        res.json({ret:0, msg:"success-query", data:{hadAdd : hadAdd } });
    },

    code : function (params, req , res){
        http.get(params.target  , function(response){
            var buffer = '';
            response.on('data' , function (chunk){
                buffer += chunk.toString();
            }).on('end' , function (){
                res.json({ret:0, msg:"success-query", data:buffer});
            });
        })
    }
};

module.exports = LogAction;

