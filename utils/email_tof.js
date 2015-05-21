/* global module */
var child_process = require('child_process');

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

module.exports = function(from, to, cc, title, content) {
    var cmd = ['./utils/uniform_msg_client mail'];
    cmd.push('-T', wrap(fixMail(to)));
    cmd.push('-C', wrap(fixMail(cc)));
    cmd.push('-S', wrap(title));
    cmd.push('-c', wrap(content));

    child_process.exec(cmd.join(' '), function(error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
};