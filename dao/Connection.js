/**
 *  @info: mysql 连接池
 *  @author: coverguo
 *  @date: 2014-12-30
 */
var orm = require("orm");

module.exports = orm.connect("mysql://root:123456@localhost:3306/badjs");