
var EmailService = require("../service/EmailService");

GLOBAL.pjconfig = require('../project.json');
//GLOBAL.DEBUG = true;


GLOBAL.pjconfig.sendEmailflag = true;
GLOBAL.pjconfig.sendEmailId = 991;

GLOBAL.pjconfig.sendEmailList = ["chriscai@tencent.com"];

EmailService.queryAll()