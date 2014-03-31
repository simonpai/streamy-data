var stream = require('stream'),
	request = require('request'),
	util = require('util'),
	Dequeue = require('dequeue');

Dequeue.prototype.isEmpty = function () {
	return this.length == 0;
}

var PageCrawlingStream = function (options) {
	options = options || {};
	options.objectMode = true;
	
	stream.Readable.call(this, options);
	this._buffer = new Dequeue();
	
	this._nextUrl = options.start;
	if (options.step)
		this._step = options.step;
	if (options.parse)
		this._parse = options.parse;
};

util.inherits(PageCrawlingStream, stream.Readable);

PageCrawlingStream.prototype._parse = function (current, result, push) {};

PageCrawlingStream.prototype._step = function (current, result) {
	return null;
};

PageCrawlingStream.prototype._fetchNextPage = function () {
	
	var url = this._nextUrl,
		buffer = this._buffer;
	
	request(url, function (error, response, body) {
		
		var ret = {
			error: error,
			response: response,
			body: body
		};
		
		// emit chunks
		this._parse(url, ret, buffer.push.bind(buffer));
		
		// determine next url
		this._nextUrl = this._step(url, ret);
		if (this._nextUrl == null)
			this._lastUrl = true;
		
		this._pushBuffered();
		
	}.bind(this));
};

PageCrawlingStream.prototype._pushBuffered = function () {
	while (!this._buffer.isEmpty()) {
		if (this.push(this._buffer.shift()) === false)
			break;
	}
};

PageCrawlingStream.prototype._read = function (size) {
	if (!this._buffer.isEmpty()) {
		this._pushBuffered();
	} else if (this._lastUrl) {
		this.push(null);
	} else {
		this._fetchNextPage();
	}
};

module.exports = PageCrawlingStream;
