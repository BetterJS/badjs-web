
var EmailService = require("../service/EmailService");

GLOBAL.pjconfig = require('../project.json');
//GLOBAL.DEBUG = true;


GLOBAL.pjconfig.sendEmailId = 991;


EmailService.queryAll( undefined , {sendId : 991 , sendToList :["chriscai@tencent.com"] , sendCcList : []}  )