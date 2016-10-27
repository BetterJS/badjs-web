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
                res.render('userManage', { layout: false, user: user, index:'manage', manageTitle: '项目用户权限' , items : item} );
            });
        }else {
            businessService.findBusinessByProjectOwner(user.loginName , function (err, item){
                res.render('userManage', { layout: false, user: user, index:'manage', manageTitle: '项目用户权限' , items : item} );
            });
        }

    },

    authUserManger : function (params , req ,  res){
        var user = req.session.user;
        res.render('authUserManage', { layout: false, user: user, index:'manage', manageTitle: '注册用户列表' } );

    },

    login : function (params , req ,  res){

        var method = req.method.toLowerCase();
        if(method == "post"){

            var userDao = req.models.userDao;

            userDao.one({ loginName : req.body.username } ,function (err , user) {
                if(err || !user || (crypto.createHash("md5").update(req.body.password).digest('hex') != user.password)){
                    res.render('login', { name:req.body.username,   isUseOA : !! global.pjconfig.oos, index:"login"   , message : "帐号或则密码错误"} );
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
            res.render('login', {  isUseOA : !! global.pjconfig.oos, message : "" } );
        }

    },

    register : function (params , req ,  res){

        var method = req.method.toLowerCase();
        if(method == "post"){

            if( !req.body.username || !req.body.password) {
                res.render('register', { isUseOA : !! global.pjconfig.oos, name: req.body.username ,  message : "帐号密码不能为空"} );
                return ;
            }else if( req.body.password != req.body.password2) {
                res.render('register', { isUseOA : !! global.pjconfig.oos, name: req.body.username ,  message : "密码和确认密码不一致"} );
                return ;
            }

            var userDao = req.models.userDao;

            userDao.one({ loginName : req.body.username } ,function (err , user) {
                if(err){
                   logger.error("register user error : " + err.toString());
                    res.render('register', { isUseOA : !! global.pjconfig.oos,  name: req.body.username ,  message : "系统错误，请联系管理员"} );
                } else if(user){
                    res.render('register', {isUseOA : !! global.pjconfig.oos,  name: req.body.username ,  message : "用户已经存在"} );
                    return ;
                } else {
                    var newUser = { chineseName: req.body.username, role : 0 ,loginName : req.body.username ,password : crypto.createHash("md5").update(req.body.password).digest('hex')};
                    userDao.create(newUser  , function (err) {
                        if(err){
                            res.render('register', { isUseOA : !! global.pjconfig.oos,     message : "系统错误，请联系管理员"} );
                        }
                        res.render('register', { isUseOA : !! global.pjconfig.oos,  type : "1", message : '注册成功 '} )

                    });
                }
            });

        }else {
            res.render('register', {   isUseOA : !! global.pjconfig.oos, message : "" } );
        }

    },

    modify : function (params , req ,  res){
        var params = req.query,
            user  = req.session.user;

        var method = req.method.toLowerCase();
        if(method == "post"){

            if( !req.body.newpassword || !req.body.oldpassword) {
                res.render('modifyUser', {  layout:false, user: user , index:'modifyUser', manageTitle: '修改密码',    message : "密码不能为空"} );
                return ;
            }if( req.body.newpassword != req.body.newpassword2) {
                res.render('modifyUser', {  layout:false, user: user , index:'modifyUser', manageTitle: '修改密码' , message : "密码和确认密码不一致"} );
                return ;
            }else if( req.body.oldpassword == req.body.newpassword) {
                res.render('modifyUser', {  layout:false, user: user , index:'modifyUser', manageTitle: '修改密码' , message : "新旧密码不能一致"} );
                return
            }

            var userDao = req.models.userDao;

            userDao.one({ loginName : user.loginName } ,function (err , user) {
                var newpassword =  crypto.createHash("md5").update(req.body.newpassword).digest('hex')
                var oldpassword =  crypto.createHash("md5").update(req.body.oldpassword).digest('hex')
                if(err){
                    logger.error("modifyUser user error : " + err.toString());
                    res.render('modifyUser', {   layout:false, user: user , index:'modifyUser', manageTitle: '修改密码'  ,  message : "系统错误，请联系管理员"} );
                }else if(!user){
                    res.render('modifyUser', {    layout:false, user: user , index:'modifyUser', manageTitle: '修改密码'  ,  message : "用户不存在"} );
                }else if (oldpassword != user.password){
                    res.render('modifyUser', {    layout:false, user: user , index:'modifyUser', manageTitle: '修改密码'  ,  message : "原始密码不正确"} );
                }else {
                    user.password = newpassword;
                    user.save( function (err) {
                        if(err){
                            res.render('modifyUser', {  layout:false, user: user , index:'modifyUser', manageTitle: '修改密码'  ,    message : "系统错误，请联系管理员"} );
                        }
                        req.session.user = null;
                        res.render('modifyUser', {  layout:false, user: user , index:'modifyUser', manageTitle: '修改密码'  ,   type : "1", message : '修改成功 ,3s 后跳转到登录界面'} );

                    });
                }
            });

        }else {

            res.render('modifyUser', { layout:false, user: user , index:'modifyUser', manageTitle: '修改密码'} );
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

    update:function(req, res){

    },
    remove: function(){


    }

};

module.exports = userAction;

