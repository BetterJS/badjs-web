/**
 * @info : APPLY ACION
 * @author : coverguo
 * @date : 2015-01-07
 */


var log4js = require('log4js'),
    logger = log4js.getLogger(),
    _ = require('underscore'),
    crypto = require('crypto'),
    ApplyService = require('../../service/ApplyService'),
    isError = function(res, error) {
        if (error) {
            res.json({
                ret: 1,
                msg: error
            });
            return true;
        }
        return false;
    };

var REG_DOMAIN_STAR = /^\*(\.[^\/]+)?$/;
var REG_REFERER = /^https?:\/\/[^\/]+\//i;

var processData = function(data) {
    _.each(data, function(value, key) {
        if (value.createTime) {
            value.createTime = (new Date(value.createTime) - 0);
        }

        if (value.passTime) {
            value.passTime = (new Date(value.passTime) - 0);
        }
    });

    return data;
};


var applyAction = {

    addApply: function(params, req, res) {
        // 必要信息为空，则报错
        var url = params.url;
        var url_no_match = !REG_DOMAIN_STAR.test(url) && !REG_REFERER.test(url);
        if (params.name === "" || url_no_match) {
            res.json({
                ret: 1002,
                msg: "params error"
            });
            return;
        }

        var apply = params;
        apply.userName = params.user.loginName;

        var applyService = new ApplyService();
        if (apply.id) {
            applyService.update(apply, function(err, items) {
                if (isError(res, err)) {
                    return;
                }
                res.json({
                    ret: 0,
                    msg: "success-add"
                });
            });
        } else {
            apply.status = 0;
            apply.createTime = new Date();
            apply.appkey = crypto.createHash("md5").update(new Date - 0 + "badjsappkey" + params.user.loginName).digest('hex');
            applyService.add(apply, function(err, items) {
                if (isError(res, err)) {
                    return;
                }
                res.json({
                    ret: 0,
                    msg: "success-add"
                });
            });
        }

    },
    queryListByUser: function(params, req, res) {
        var applyService = new ApplyService();
        if (params.user.role != 1) {
            applyService.queryListByUser(params, function(err, items) {
                if (isError(res, err)) {
                    return;
                }
                res.json({
                    ret: 0,
                    msg: "success",
                    data: {
                        role: params.user.role,
                        item: processData(items)
                    }
                });
            });
        } else {
            applyService.queryListByAdmin(params, function(err, items) {
                if (isError(res, err)) {
                    return;
                }
                res.json({
                    ret: 0,
                    msg: "success",
                    data: {
                        role: params.user.role,
                        item: processData(items)
                    }
                });
            });
        }

    },
    queryListByAdmin: function(params, req, res) {
        var applyService = new ApplyService();
        //不是管理员的话直接返回错误提示
        if (params.user.role != 1) {
            res.json({
                ret: 1003,
                msg: "权限不足"
            });
            return;
        }
        applyService.queryListByAdmin(params, function(err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({
                ret: 0,
                msg: "success",
                data: processData(items)
            });
        });
    },
    queryListBySearch: function(params, req, res) {
        var applyService = new ApplyService();

        var searchParam = {};
        if (params.user.role != 1) {
            searchParam.userName = params.user.loginName;
        }

        //搜索全部
        if (params.statusType != 3) {
            searchParam.status = params.statusType;
        }

        applyService.queryListBySearch(searchParam, function(err, items) {
            if (isError(res, err)) {
                return;
            }
            res.json({
                ret: 0,
                msg: "success",
                data: {
                    role: params.user.role,
                    item: processData(items)
                }
            });
        });
    },
    queryByApplyId: function(params, cb) {
        var applyService = new ApplyService();
        applyService.queryById({
            id: params.applyId
        }, function(err, apply) {
            cb(err, apply);
        });
    },
    update: function(params, req, res) {
        var as = new ApplyService();
        as.update(params, function() {

        });
    },
    remove: function(params, req, res) {
        var applyService = new ApplyService();
        applyService.remove(params, function(err) {
            if (err) {
                res.json({
                    ret: 3,
                    msg: "fail remove"
                });
            } else {
                res.json({
                    ret: 0,
                    msg: "success remove"
                });
            }

        });
    }

};

module.exports = applyAction;