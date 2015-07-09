var  log4js = require('log4js'),
    logger = log4js.getLogger();



var argv = process.argv.slice();
if(argv.indexOf('--debug') >= 0){
    logger.setLevel('DEBUG');
    GLOBAL.DEBUG = true;
    logger.info('running in debug');

}else {
    logger.setLevel('INFO');
}

if(argv.indexOf('--project') >= 0){
    GLOBAL.pjconfig =  require('../project.debug.json');
}else {
    GLOBAL.pjconfig = require('../project.json');
}


module.exports = function (){

}

