var map = require('./map'),
	couchbase = require('couchbase');

// TODO: provide option to buffer get/set and use getMulti/setMulti

var get = function (connection, options) {
	return map(function (key, callback) {
		connection.get(key, options, callback);
	});
};

var set = function (connection, options) {
	return map(function (pair, callback) {
		connection.set(pair.key, pair.value, options, callback);
	});
};

var view = function (connection, ddoc, view, query) {
	
	// TODO
	
};

module.exports = {
	get: get,
	set: set
	//view: view
};
