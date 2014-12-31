/**
 * *@info: User 数据实体
 *  @author: coverGuo
 *  @date: 2014-12-30
 */


var _ = require("underscore");

/**
 * role :  0 普通成员  1 管理员
 * @param args
 * @constructor User
 */
var User = function(args){
    if(!args){
        return;
    }
    _.defaults(this, _.pick(args, 'id', 'loginName', 'chineseName', 'role'));
}

User.prototype  = {
    id : undefined,
    loginName : undefined,
    chineseName: undefined,
    role : undefined
}

module.exports =  User;