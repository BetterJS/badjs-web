
/**
 *  @info: userDao
 *  @author: coverGuo
 *  @date: 2014-12-30
 */

module.exports  = function (db){
    var user = db.define("b_user", {
        id          : Number,
        loginName   : String,
        chineseName : String,
        role        : Number,
        email        : String,
        password        : String
    });

    return user;
}