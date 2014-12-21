var config = require('../package');
var des = require('./des');
var appKey = config.appKey;
var sysId = config.sysId;
	
exports.info = function() {
	var random = Math.floor(Math.random() * 10000);
	var timestamp = Math.round(Date.now() / 1000);
	var data = 'random' + random + 'timestamp' + timestamp;
	var key = (sysId + '--------').substring(0, 8);
	var signature = des.encrypt(data, key);
	return {
	    'appkey': appKey,
	    'random': random,
	    'timestamp': timestamp,
	    'signature': signature
	};
}