/**
 * Created by chriscai on 2015/1/15.
 */


var BusinessService = require('../../service/BusinessService');

var fs = require("fs");
var path = require("path");

var  log4js = require('log4js'),
    logger = log4js.getLogger();

var IndexAction = {



    index :  function(parm , req, res){
        var params = req.query,
            user  = req.session.user;

        var businessService =  new BusinessService();

        businessService.findBusinessByUser(user.loginName , function (err, item){
            res.render('log', { layout: false, user: user, index:"log" , items : item} );
        });


    },


    realtime :  function(parm , req, res){
        var params = req.query,
            user  = req.session.user;

        var businessService =  new BusinessService();

        businessService.findBusinessByUser(user.loginName , function (err, item){
            res.render('realtimelog', { layout: false, user: user, index:"realtime" , items : item , systime : new Date - 0} );
        });
    },

    offline :  function(parm , req, res){

        var params = req.query,
            user  = req.session.user;

        var businessService =  new BusinessService();

        businessService.findBusinessByUser(user.loginName , function (err, item){
            res.render('offlinelog', { layout: false, user: user, index:"offlinelog" , items : item , systime : new Date - 0} );
        });
    }


};

module.exports = IndexAction;
