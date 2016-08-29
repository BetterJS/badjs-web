/* global module */
var log4js = require('log4js');
var logger = log4js.getLogger();
var emailjs = require("emailjs");
var EmailServer = null;
var RETRY = 3;

module.exports = function(from, to, cc, title, content) {
    logger.info("Send email " + title);
    var message = {
        from: from,
        to: to.join(","),
        cc: cc.join(","),
        text: title,
        subject: title,
        attachment: [{
            data: content || '<html></html>',
            alternative: true
        }]
    };

    (function send(message, times) {
        if (!EmailServer) {
            EmailServer = emailjs.server.connect({
                host: GLOBAL.pjconfig.email.smtp,
                user:   GLOBAL.pjconfig.email.smtpUser, 
                password: GLOBAL.pjconfig.email.smtpPassword ,  
                ssl: false
            });
        }
        EmailServer.send(message, function(err, data) {
            times--;
            if (err ) {
                logger.error("Send email error " + title);
                EmailServer = null;
                return times>0 && send(message, times);
            }
            logger.info("Send email success " + title);
        });
    })(message, RETRY);
};
