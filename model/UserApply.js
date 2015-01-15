/**
 * *@info: userApply 数据实体
 *  @author: coverGuo
 *  @date: 2015-01-15
 */

var _ = require('underscore')._;

var User_Apply = function (args){

    if(!args){
        return ;
    }

    _.defaults(this ,  _.pick(args , 'userId' ,'applyId' ,'createTime', 'role' ));
}

User_Apply.prototype = {
    userId : undefined,
    applyId : undefined,
    createTime : undefined,
    role : undefined
}

module.exports =  User_Apply;
