var util = require('util'),
	request = require('./util/request'),
	hp = require("./util/htmlparser"),
	hpu = hp.DomUtils,
	WebpageCrawlingStream = require('./stream/webpage-crawling-stream'),
	map = require('./map');

var jar = request.jar(),
	cookie = request.cookie("over18=1");

var _parseComment = function (node) {
	var subtype, author, content, time;
	if (!node.children)
		return {};
	node.children.forEach(function (c) {
		var cls = c.attribs.class,
			cnt = (c.children && c.children[0] && c.children[0].data) || '';
		if (!cls)
			return;
		if (cls.indexOf('push-tag') > -1)
			subtype = 
				cnt.indexOf('推') > -1 ? 1 : 
				cnt.indexOf('噓') > -1 ? 2 : 0;
		else if (cls.indexOf('push-userid') > -1)
			author = cnt;
		else if (cls.indexOf('push-content') > -1)
			content = cnt.substring(1);
		else if (cls.indexOf('push-ipdatetime') > -1)
			time = cnt.trim();
	});
	return { type: 'comment', subtype: subtype, author: author, 
		content: content, time: time };
};

var _parseMetaline = function (node) {
	var tag, value;
	if (!node.children)
		return {};
	node.children.forEach(function (c) {
		var cls = c.attribs.class,
			cnt = (c.children && c.children[0] && c.children[0].data) || '';
		if (!cls)
			return;
		if (cls.indexOf('article-meta-tag') > -1)
			tag = cnt;
		else if (cls.indexOf('article-meta-value') > -1)
			value = cnt;
	});
	return { tag: tag, value: value };
};

var _parsePostResponse = function (data, raw) {
	var url = data.url,
		body = data.body,
		result = { board: url.board, post: url.post },
		handler, parser;
	
	handler = new hp.DefaultHandler(function (error, dom) {}, { 
		verbose: false, ignoreWhitespace: true
	});
	parser = new hp.Parser(handler);
	parser.parseComplete(body);
	
	if (url.author)
		result.author = url.author;
	if (url.title)
		result.title = url.title;
	
	// title
	// note: this won't be available in forwarded posts
	// <meta property="og:title" content="[TITLE]" />
	var tm = /property="og:title" content="([^"]*)"/.exec(body);
	if (tm)
		result.title = tm[1];
	
	// list of content/comments
	var content = result.content = [], 
		buffer = [], 
		scores = result.scores = [0, 0, 0],
		cmt, 
		meta = result.meta = [];
	hpu.getElementById('main-content', handler.dom).children.forEach(function (node) {
		var cls = node.attribs && node.attribs.class;
		
		if (cls && cls.indexOf('article-metaline') > -1) {
			meta.push(_parseMetaline(node));
			return;
		}
		
		if (cls && cls.indexOf('richcontent') > -1)
			return;
		
		if (cls && cls.indexOf('push') > -1) {
			if (buffer.length)
				content.push(buffer.join(''));
			buffer = [];
			content.push(cmt = _parseComment(node));
			scores[cmt.subtype]++;
			return;
		}
		
		buffer.push(hpu.text(node));
	});
	if (buffer.length)
		content.push(buffer.join(''));
	
	var tag, value;
	meta.forEach(function (pair) {
		tag = pair.tag;
		value = pair.value;
		if (tag === '時間') {
			var date = new Date(value); // TODO: might be implementation dependent
			if (date)
				result.timestamp = date.getTime();
		} else if (tag === '作者') {
			// id (nickname)
			var m = /([\w\d]+)\s*\((.*)\)\s*$/.exec(value);
			if (m) {
				if (!result.author) // author parsed here may not be accurate
					result.author = m[1];
				result.nickname = m[2];
			}
		}
	});
	
	if (raw)
		result.raw = data.body;
	
	return result;
};

var _parseBoardResponse = function (board) {
	return function (current, result, push) {
		var handler, parser, listElem, results = [],
			elem, title, href, post, author, date;
		
		if (result.error)
			throw result.error;
		
		handler = new hp.DefaultHandler(function (error, dom) {}, { 
			verbose: false, ignoreWhitespace: true
		});
		parser = new hp.Parser(handler);
		parser.parseComplete(result.body);
		
		listElem = hpu.getElementsByClass('r-list-container', handler.dom)[0];
		if (!listElem)
			throw 'Unexpected response body: ' + result.body;
		if (!listElem.children)
			return; // empty page
		
		listElem.children.forEach(function (entryElem) {
			if (!entryElem.children)
				return;
			elem = hpu.getElementsByTagName('a', entryElem)[0];
			if (elem) {
				href = elem.attribs && elem.attribs.href;
				title = elem.children && elem.children[0].data;
				if (href) {
					post = /\/([^/]+)\.html$/.exec(href);
					if (post)
						post = post[1];
				}
			}
			elem = hpu.getElementsByClass('author', entryElem)[0];
			if (elem)
				author = elem.children && elem.children[0].data;
			elem = hpu.getElementsByClass('date', entryElem)[0];
			if (elem)
				date = elem.children && elem.children[0].data;
			if (author && post) {
				results.push({
					board: board,
					author: author,
					date: date,
					post: post,
					title: title,
					href: href
				});
			}
			title = href = post = author = date = null;
		});
		
		// reverse the order
		for (var i = results.length; i;)
			push(results[--i]);
		
	};
};

var util = {
	
	getBoardUrl: function (board, pageNum) {
		var url = "http://www.ptt.cc/bbs/" + board + 
			"/index" + (pageNum != null ? pageNum : "") + ".html"
		jar.setCookie(cookie, url);
		return {
			url: url,
			jar: jar,
			board: board,
			pageNum: pageNum
		};
	},
	
	getPostUrl: function (data) {
		var url = "http://www.ptt.cc/bbs/" + data.board + "/" + data.post + ".html"
		jar.setCookie(cookie, url);
		var result = {
			board: data.board,
			post: data.post,
			url: url,
			jar: jar
		};
		if (data.author)
			result.author = data.author;
		if (data.title)
			result.title = data.title;
		return result;
	},
	
	getPost: function (data, options, callback) {
		options = options || {};
		var ignoreError = options.ignoreError != null ? options.ignoreError : true,
			url = util.getPostUrl(data);
		request(url, function (error, response, body) {
			if (error && ignoreError) {
				callback(); // ignore this entry
			} else {
				callback(error, !error && _parsePostResponse({
					url: url,
					response: response,
					body: body
				}, options.raw));
			}
		});
	}
	
};

var board = function (board, options) {
	options = options || {};
	var end = options.end || 1,
		count = options.limit;
	return new WebpageCrawlingStream({
		start: util.getBoardUrl(board, options.start),
		step: function (current, result) {
			var board = current.board,
				pageNum = current.pageNum,
				newPageNum = pageNum && pageNum - 1,
				ret;
			
			if (newPageNum == null) {
				ret = /\s+href=".+\/index(\d+)\.html">&lsaquo; 上頁<\/a>/
					.exec(result.body.replace(/[\r\n]/g, ""));
				newPageNum = ret && parseInt(ret[1], 10);
			}
			
			return (!newPageNum || newPageNum < end || (count != null && --count < 1)) ? 
				null : util.getBoardUrl(board, newPageNum);
		},
		parse: _parseBoardResponse(board),
		highWaterMark: 32,
		retry: {
			limit: 10
		}
	});
};

var post = function (options) {
	return map(function (data, callback) {
		util.getPost(data, options, callback);
	});
};

module.exports = {
	board: board,
	post: post,
	util: util
};
