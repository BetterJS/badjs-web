
/**
 *  @info: userDao
 *  @author: coverGuo
 *  @date: 2014-12-30
 */

module.exports  = function (db){
    var Statistics = db.define("b_statistics", {
        id          : Number,
        projectId   : Number,
        startDate   : Date,
        endDate     : Date,
        content     : Number,
        total       : Number
    });

    return Statistics;
}