var stream = require('stream'),
	util = require('util'),
	Dequeue = require('dequeue');

Dequeue.prototype.isEmpty = function () {
	return this.length == 0;
}

var PagedReadableStream = function (options) {
	options = options || {};
	options.objectMode = true;
	options.highWaterMark = options.highWaterMark || 16; // node 0.10 bug
	
	stream.Readable.call(this, options);
	
	this._buffer = new Dequeue();
	
	if (options.more)
		this._more = options.more;
};

util.inherits(PagedReadableStream, stream.Readable);

// trivial default implementation
PagedReadableStream.prototype._more = function (push, callback) {
	callback(true);
};

PagedReadableStream.prototype._pushBuffered = function () {
	var buffer = this._buffer;
	
	while (!buffer.isEmpty()) {
		if (this.push(buffer.shift()) === false)
			break;
	}
};

PagedReadableStream.prototype._callMore = function () {
	var buffer = this._buffer;
	this._more(buffer.push.bind(buffer), function (done) {
		if (done) {
			this._done = true;
			
		} else if (buffer.isEmpty()) {
			this._callMore();
			
		}
		this._pushBuffered();
		// if nothing is pushed from this cycle & done, need to call done
		if (done && buffer.isEmpty())
			this.push(null);
	}.bind(this));
};

PagedReadableStream.prototype._read = function (size) {
	var buffer = this._buffer;
	
	if (!buffer.isEmpty()) {
		this._pushBuffered();
		
	} else if (this._done) {
		this.push(null);
		
	} else {
		this._callMore();
	}
};

module.exports = PagedReadableStream;
