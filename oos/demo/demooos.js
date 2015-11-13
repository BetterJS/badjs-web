var oa = require('yourOaModuel');
var crypto = require('crypto');
var log4js = require('log4js'),
    logger = log4js.getLogger();

var isError = function(res, error) {
    if (error) {
        res.json({
            ret: 1,
            msg: error
        });
        return true;
    }
    return false;
};

module.exports = function(req, res, next) {
    var params = req.query,
        user = req.session.user,
        userDao = req.models.userDao;

    req.indexUrl = req.protocol + "://" + req.get('host') + '/user/index.html';

    //跳转到 oa 进行登录
    if (/^\/oalogin/i.test(req.url)) {
        var redirectUrl = req.indexUrl;
        res.redirect('http://youroalogin.com?url=' + redirectUrl);
        return;
    }
    //判断是否有ticket ，一般的oa统一登录都会有用 ticket进行统一登录
    if (params && params.ticket) {
        // 调用你的oa 组件，进行登录处理
        oa.passport(params.ticket, function(result) {
            if (result) {

                // 存入session ，用于判断此用户已经登录
                user = req.session.user = {
                    loginName: result.LoginName,
                    chineseName: result.ChineseName,
                    role: 0
                };


                userDao.one({
                    loginName: result.LoginName
                }, function(err, dbUser) {
                    if (isError(res, err)) {
                        return;
                    }

                    // 用户没有登录 badjs， 进行创建用户信息
                    if (!dbUser) {
                        req.session.user.email = user.loginName + GLOBAL.pjconfig.email.emailSuffix;
                        req.session.user.password = crypto.createHash("md5").update(user.loginName).digest('hex');

                        userDao.create(req.session.user, function(err, result) {
                            if (isError(res, err)) {
                                return;
                            }

                            req.session.user.role = result.role;
                            req.session.user.id = result.id;

                            logger.info("New User:" + JSON.stringify(req.session.user) + "insert into db-badjs");
                            next();
                        });
                    } else {
                        // 已经登陆过了，将更加详细的信息注入到session中
                        logger.info("Old User:" + JSON.stringify(req.session.user));
                        req.session.user.role = dbUser.role;
                        req.session.user.id = dbUser.id;
                        req.session.user.email = dbUser.email;

                        // 用户没有登陆过，但是在 http://badjs.server.com/user/userManage.html 创建过id
                        // 讲oa 回传的信息存入数据库
                        if (!dbUser.chineseName) {
                            dbUser.chineseName = result.ChineseName;
                            dbUser.save(function(err, result) {});
                        }
                        next();
                    }

                });

            } else {
                res.send(403, 'Sorry! you can not see that.');
            }
        });
    } else {
        next();
    }
};