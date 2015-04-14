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

var LogAction = {
    queryLogList : function (params, req , res) {

        var logService = new LogService();

        for(var key in params){
            params['endDate'] -=0;
            params['startDate'] -=0;
            params['id'] -=0;
        }
        logService.query(params,function(err, items){
            if(isError(res, err)){
                return;
            };

     /*      [ {
            _id: "552cf6441c715a952748137b",
            all: ";uin=NaN;from=http://mobileapp.ke.qq.com/app2h5/agencyHome.html?_wv=1025&_bid=167&plg_auth=1#aid=10044;msg=localstorage not hit;url=http://mobileapp.ke.qq.com/app2h5/agencyHome.html?_wv=1025&_bid=167&plg_auth=1#aid=10044;level=4;ip=27.213.142.103;userAgent=Mozilla/5.0 (Linux; U; Android 4.0.3; zh-cn; U9500 Build/HuaweiU9500) AppleWebKit/533.1 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.4 TBS/025411 Mobile Safari/533.1 MicroMessenger/6.1.0.73_r1097298.543 NetType/WIFI",
            date: "2015-04-14T11:13:08.848Z",
            from: "http://mobileapp.ke.qq.com/app2h5/agencyHome.html?_wv=1025&_bid=167&plg_auth=1#aid=10044",
            ip: "27.213.142.103",
            level: 4,
            msg: "localstorage not hit"
            uin: "NaN"
            url: "http://mobileapp.ke.qq.com/app2h5/agencyHome.html?_wv=1025&_bid=167&plg_auth=1#aid=10044"
            userAgent: "Mozilla/5.0 (Linux; U; Android 4.0.3; zh-cn; U9500 Build/HuaweiU9500) AppleWebKit/533.1 (KHTML, like Gecko)Version/4.0 MQQBrowser/5.4 TBS/025411 Mobile Safari/533.1 MicroMessenger/6.1.0.73_r1097298.543 NetType/WIFI"
            }]*/
            res.json({ret:0, msg:"success-query", data:items });
        });
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

