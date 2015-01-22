/**
 * Created by coverguo on 2015/1/12.
 */

var log4js = require('log4js'),
    logger = log4js.getLogger(),
    UserService = require('../../service/UserService'),
    BusinessService = require('../../service/BusinessService'),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };


var userAction = {
    index: function(req, res){
        var params = req.query,
            user  = req.session.user;

        var businessService =  new BusinessService();

        if(user.role == 1 ){
            businessService.findBusiness(  function (err, item){
                res.render('userManage', { layout: false, user: user, index:'manage', title: '用户列表' , items : item} );
            });
        }else {
            businessService.findBusinessByProjectOwner(user.loginName , function (err, item){
                res.render('userManage', { layout: false, user: user, index:'manage', title: '用户列表' , items : item} );
            });
        }

    },
    addUser: function(params, cb){
        var us = new UserService();
        us.add(params,cb);
    },
    queryListByCondition : function (params, res) {
        var userService = new UserService();
        //用户根据项目查询项目成员
        if(params.applyId && params.role){
            params.applyId -=0;
            params.role -=0;
        }else{
            res.json({ret:1002, msg:"need some params"});
            return;
        }

        userService.queryListByCondition(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, data:items, msg:"success"});
        });
    },
    queryAllList : function (params, res) {

        var userService = new UserService();
        //用户根据项目查询项目成员
        userService.queryAllList(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, data:items, msg:"success"});
        });
    },
    queryListByUserProject : function(params, res){
        var userService = new UserService();
        //用户根据项目查询项目成员
        userService.queryListByUserProject(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, data:items, msg:"success"});
        });
    },
    update:function(req, res){

    },
    remove: function(){


    }

};

module.exports = userAction;

