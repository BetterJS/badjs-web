var crypto = require('crypto');

exports.encrypt = function (data, key) {
	var key = new Buffer(key, 'ascii').toString('binary');
	var vi = key;
	var cipher = crypto.createCipheriv('des-cbc', key, vi);
	var result = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
    return result.toUpperCase();
};

exports.decrypt = function (data, key) {
	var key = new Buffer(key, 'ascii').toString('binary');
	var vi = key;
	var cipher = crypto.createDecipheriv('des-cbc', key, vi);
	var result = cipher.update(data, 'hex', 'utf8') + cipher.final('utf8');
    return result;
};