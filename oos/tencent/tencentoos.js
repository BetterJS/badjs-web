var tof = require('./oa/node-tof');
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
    //获取用户model
        userDao = req.models.userDao;

    req.indexUrl = req.protocol + "://" + req.get('host') + '/user/index.html';

    if (/^\/oalogin/i.test(req.url)) { // 登录
        var redirectUrl = req.indexUrl;
        res.redirect('http://passport.oa.com/modules/passport/signin.ashx?url=' + redirectUrl);
        return;
    }
    if (params && params.ticket) { // oa 登录跳转
        tof.passport(params.ticket, function(result) {
            if (result) {
                //登录成功
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

                    if (!dbUser) { //第一次登陆，将用户信息写入数据库
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
                    } else { // 已经登录过，判断是否更新信息
                        logger.info("Old User:" + JSON.stringify(req.session.user));
                        req.session.user.role = dbUser.role;
                        req.session.user.id = dbUser.id;
                        req.session.user.email = dbUser.email;

                        // 尚未登录过， 但是添加过，分配中文名字
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