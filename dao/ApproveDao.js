/**
 *  @info: approveDao
 *  @author: coverguo
 *  @date: 2014-12-30
 */

module.exports  = function (db){
    var approve = db.define("b_approve", {
        id          : Number,
        userName    : String,
        reply       : String,
        createTime  : Date,
        applyId     : Number,
        applyStatus : Number
    });
    return approve;
}