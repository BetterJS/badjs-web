
/**
 *  @info: statisticsDao
 *  @author: chriscai
 *  @date: 2014-01-14
 */

module.exports  = function (db){
    var Statistics = db.define("b_statistics", {
        id          : Number,
        projectId   : Number,
        startDate   : Date,
        endDate     : Date,
        content     : String,
        total       : Number
    });

    return Statistics;
}
