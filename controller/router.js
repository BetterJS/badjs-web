/**
 * @info : 页面申请路由
 * @author : coverguo
 * @date : 2014-12-16
 */

var logAction = require('./action/LogAction')
    , URL = require('url');

module.exports = function(app){
    var isError = function (res , error){
        if(error){
            console.log(error);
            res.json({ret : 1 , err_msg : error});
            return true;
        }
        return false;

    };

    /**
    * 查看log列表
    * */
    app.get('/controller/action/queryLogList.do', function(req, res){
        logAction.getLogList(req.query,function(err,data){
            if(isError(res, err)){
               return;
            }
            res.json({ret:0, data: data});
        });

    })
 };
