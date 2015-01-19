/**
 *  @info: UserApplyDao
 *  @author: coverguo
 *  @date: 2014-01-15
 */

module.exports  = function (db){
    var user_apply = db.define("b_user_apply", {
        userId      : Number,
        applyId     : Number,
        role        : Number,
        createTime  : Date
    });
    return user_apply;
};