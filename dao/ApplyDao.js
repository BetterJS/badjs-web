
/**
 *  @info: ApplyDao
 *  @author: coverGuo
 *  @date: 2014-12-30
 */
//status: 0 审核中- 1-审核通过， 2-审核失败
module.exports  = function (db){
    var apply = db.define("b_apply", {
        id          : Number,
        userName    : String,
        status      : Number,
        name        : String,
        appkey      : String,
        url         : String,
        blacklist   : String,
        description : String,
        mail        : String,
        createTime  : Date,
        passTime    : Date
    });

    return apply;
}
