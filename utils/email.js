/* global module */
var emailjs = require("emailjs");
var EmailServer = null;
var RETRY = 3;

module.exports = function(from, to, cc, title, content) {
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
                host: "smtp.tencent.com",
                ssl: false
            });
        }
        EmailServer.send(message, function(err, data) {
            times--;
            if (err) {
                EmailServer = null;
                return times && send(message, times);
            }
        });
    })(message, RETRY);
};