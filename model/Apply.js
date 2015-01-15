/**
 * *@info: Apply 数据实体
 *  @author: coverGuo
 *  @date: 2014-12-30
 */


var _ = require('underscore')._;

/**
 * status 0 审核中 , 1 通过  , 2 不通过
 * @param args
 * @constructor
 */
var Apply = function (args){
    if(!args){
        return ;
    }
    _.defaults( this ,  _.pick(args , 'userName' ,'name' ,  'id' ,  'description' , 'main', 'createTime' , 'passTime' ) );
}


Apply.prototype  = {
    userName : undefined,
    name : undefined,
    url : undefined,
    status : undefined,
    id : undefined,
    mail : undefined,
    description : undefined,
    createTime : undefined,
    passTime : undefined
}

Apply.STATUS_APPLYING = 0 ; // 审核中
Apply.STATUS_PASS = 1 ; // 通过
Apply.STATUS_FAIL = 2 ; // 拒绝

module.exports =  Apply;