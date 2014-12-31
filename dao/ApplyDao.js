
/**
 *  @info: ApplyDao
 *  @author: coverGuo
 *  @date: 2014-12-30
 */

module.exports  = function (db){
    var apply = db.define("b_apply", {
        id          : Number,
        userName    : String,
        status      : Number,
        name        : String,
        url         : String,
        description : String,
        mail        : String,
        published   : Number,
        createTime  : Date,
        passTime    : Date
    });

    return apply;
}