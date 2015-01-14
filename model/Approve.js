/**
 * *@info: Approve 数据实体
 *  @author: coverGuo
 *  @date: 2014-12-30
 */

var _ = require('underscore')._;

var Approve = function (args){

    if(!args){
        return ;
    }

    _.defaults(this ,  _.pick(args , 'id' ,'reply' , 'applyId' ));
}

Approve.prototype = {
    id : undefined,
    reply : undefined,
    applyId : undefined,
    userName : undefined,
    createTime : undefined,
    applyStatus : undefined
}

module.exports =  Approve;
