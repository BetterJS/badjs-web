/**
 * Created by coverguo on 2015/1/12.
 */

var log4js = require('log4js'),
    logger = log4js.getLogger(),
    UserService = require('../../service/UserService'),
    crypto = require('crypto'),
    BusinessService = require('../../service/BusinessService'),
    isError = function (res , error){
        if(error){
            res.json({ret : 1 , msg : error});
            return true;
        }
        return false;
    };


var userAction = {
    index: function(params , req ,  res){
        var params = req.query,
            user  = req.session.user;

        var businessService =  new BusinessService();

        if(user.role == 1 ){
            businessService.findBusiness(  function (err, item){
                res.render('userManage', { layout: false, user: user, index:'manage', manageTitle: '用户列表' , items : item} );
            });
        }else {
            businessService.findBusinessByProjectOwner(user.loginName , function (err, item){
                res.render('userManage', { layout: false, user: user, index:'manage', title: '用户列表' , items : item} );
            });
        }

    },

    authUserManger : function (params , req ,  res){
        var user = req.session.user;
        res.render('authUserManage', { layout: false, user: user, index:'manage', title: '用户授权' } );

    },

    login : function (params , req ,  res){

        var method = req.method.toLowerCase();
        if(method == "post"){

            var userDao = req.models.userDao;

            userDao.one({ loginName : req.body.username } ,function (err , user) {
                if(err || !user || (crypto.createHash("md5").update(req.body.password).digest('hex') != user.password)){
                    res.render('login', {  user: user , index:"login"   , message : "帐号或则密码错误"} );
                }else {
                    req.session.user = {
                        role : user.role,
                        id : user.id,
                        email : user.email,
                        loginName : user.loginName ,
                        chineseName : user.chineseName
                    }
                    res.redirect(req.protocol + "://" + req.get('host') + '/user/index.html');
                }
            });

        }else {
            res.render('login', {   index:"login" ,message : "" } );
        }

    },
//    addUser: function(params, cb){
//        var us = new UserService();
//        us.add(params,cb);
//    },
    queryListByCondition : function (params , req ,  res) {
        var userService = new UserService();
        var isAdmin  = req.session.user.role == 1;
        //用户根据项目查询项目成员
        if(params.applyId && params.role){
            params.applyId -=0;
            params.role -=0;
        }else{
            res.json({ret:1002, msg:"need some params"});
            return;
        }

        if(params.user.role != 1){
            params.userId = params.user.id;
        }

        userService.queryListByCondition(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, data:items, msg:"success" , isAdmin : isAdmin});
        });
    },

    queryUserByCondition : function (params , req ,  res){
        var userService = new UserService();
        var user = req.session.user;
        var isAdmin  = req.session.user.role == 1;
        if(!isAdmin){
            res.json({ret:-1, data:{}, msg:"error" });
            return ;
        }

        var target = {};


        if(params.roleType >= 0){
            target.role = params.roleType;
        }

        userService.queryUsersByCondition(target , function (err , item){
            res.json({ret:0, data:item, msg:"success" });
        })
    },

    authUser : function (params , req ,  res){
        var userService = new UserService();
        userService.update({id : params.id, role : params.role} , function (err ){
            if(err){
                res.json({ret:-1,  msg:"error" });
            }else {
                res.json({ret:0,  msg:"success" });
            }
        })
    },
/*    queryAllList : function (params , req ,  res) {

        var userService = new UserService();
        //用户根据项目查询项目成员
        userService.queryAllList(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, data:items, msg:"success"});
        });
    },
    queryListByUserProject : function(params , req ,  res){
        var userService = new UserService();
        //用户根据项目查询项目成员
        userService.queryListByUserProject(params,function(err, items){
            if(isError(res, err)){
                return;
            }
            res.json({ret:0, data:items, msg:"success"});
        });
    },*/
    update:function(req, res){

    },
    remove: function(){


    }

};

module.exports = userAction;

