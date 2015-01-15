/**
 * Created by chriscai on 2015/1/15.
 */


var BussiessService = require('../../service/BussiessService');

var  log4js = require('log4js'),
    logger = log4js.getLogger();

var IndexAction = {


    index :  function(req, res){
        var params = req.query,
            user  = req.session.user;

        var bussiessService =  new BussiessService()

        bussiessService.findBussiessByUser(user.loginName , function (err, item){
            console.log(item)
            res.render('log', { layout: false, user: user, index:"log" , items : item} );
        });


    }
};

module.exports = IndexAction;