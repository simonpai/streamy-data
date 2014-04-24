var PagedReadableStream = require('./stream/paged-readable-stream'),
	map = require('./map'),
	util = require('util');

// TODO: provide option to buffer get/set and use getMulti/setMulti

var get = function (connection, options) {
	options = options || {};
	var includeKey = options.includeKey;
	
	return map(function (key, callback) {
		connection.get(key, options, includeKey ? function (error, result) {
			if (result != null)
				result.key = key;
			callback(error, result);
		} : callback);
	});
};

var set = function (connection, options) {
	options = options || {};
	var includeResult = options.includeResult;
	
	return map(function (pair, callback) {
		connection.set(pair.key, pair.value, options, function (error, result) {
			callback(error, includeResult ? {
				key: pair.key,
				value: pair.value,
				result: result
			} : pair);
		});
	});
};

var remove = function (connection, options) {
	options = options || {};
	var includeResult = options.includeResult;
	
	return map(function (key, callback) {
		connection.remove(key, options, function (error, result) {
			callback(error, includeResult ? {
				key: key,
				result: result
			} : key);
		});
	});
};

var ViewQueryStream = function (viewQuery, options) {
	options = options || {};
	
	PagedReadableStream.call(this, options);
	
	this._pageSize = options.bufferSize || 32;
	this._viewQuery = viewQuery;
	this._page = 0;
};

util.inherits(ViewQueryStream, PagedReadableStream);

ViewQueryStream.prototype._pushResults = function (push, results) {
	if (!results)
		return;
	results.forEach(push);
};

ViewQueryStream.prototype._more = function (push, callback) {
	var vq = this._viewQuery.q, // where its parameters are stored
		ps = this._pageSize,
		p = this._page,
		limit = vq.limit == null ? ps : Math.max(vq.limit - p * ps, 0),
		q = p == 0 ? { limit: limit } : { limit: limit, startkey: this._lastKey, 
			startkey_docid: this._lastDocId, skip: 1 };
	
	this._viewQuery.query(q, (function (error, results) {
		var empty = !results || results.length == 0,
			last = !empty && results[results.length - 1];
		
		this._lastKey = last && last.key;
		this._lastDocId = last && last.docid;
		this._page++;
		
		this._pushResults(push, results);
		callback(empty);
		
	}).bind(this));
};

// var viewQuery = connection.view(ddoc, view, query);
var view = function (viewQuery, options) {
	return new ViewQueryStream(viewQuery, options);
};

module.exports = {
	get: get,
	set: set,
	remove: remove,
	view: view
};
