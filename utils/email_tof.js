/* global module */
var child_process = require('child_process');
var log4js = require('log4js');
var logger = log4js.getLogger();


var wrap = function(str){
    return ["'", (str || '').toString().replace(/'/g, '"').replace(/[\r\n]/g, ''), "'"].join('');
};

var fixMail = function(emails){
    if (!Array.isArray(emails)) {
        return '';
    }

    var output = [];
    emails.forEach(function(v){
        var name = (v || '').toString().replace(/@[\w\W]*$/, '');
        name && output.push(name);
    });

    return output.join(";");
};

var charset = 'utf8';

module.exports = function(from, to, cc, title, content) {
    logger.info("Send email " + title);
    var cmd = ['./utils/uniform_msg_client mail'];
    cmd.push('-T', wrap(fixMail(to)));
    cmd.push('-C', wrap(fixMail(cc)));
    cmd.push('-S', wrap(title));
    cmd.push('-c', wrap(content));
    cmd.push('-d', wrap(charset));

    child_process.exec(cmd.join(' '), function(error, stdout, stderr) {
        logger.info("Send email  " + stdout);
        if (error !== null) {
            logger.error("Send email error " + error);
            logger.error("Send email error " + stderr);
        }
    });
};