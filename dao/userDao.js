
/**
 *  @info: userDao
 *  @author: coverGuo
 *  @date: 14-12-30
 */

module.exports  = function (db){
    var user = db.define("b_user", {
        id          : Number,
        name        : String,
        chineseName : String,
        role        : Number
    });

    return user;
}