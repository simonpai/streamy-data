var util = require('util'),
	request = require('request'),
	hp = require("htmlparser"),
	PageCrawlingStream = require('./stream/page-crawling-stream'),
	map = require('./map');

var jar = request.jar(),
	cookie = request.cookie("over18=1"),
	request = request.defaults({jar: jar});

var _text = function (node) {
	var buffer = [], str;
	_text0(buffer, node);
	str = buffer.join('');
	return str[str.length - 1] === '\n' ? str : str + '\n';
};

var _text0 = function (buffer, node) {
	if (node.type === 'text')
		buffer.push(node.data);
	else if (node.children)
		node.children.forEach(function (c) { _text0(buffer, c); });
};

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
				cnt.indexOf('噓') > -1 ? 2 : 3;
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
	
	// title
	// <meta property="og:title" content="[TITLE]" />
	var tm = /property="og:title" content="([^"]*)"/.exec(body);
	if (tm)
		result.title = tm[1];
	
	// list of content/comments
	var content = result.content = [], 
		buffer = [], 
		meta = result.meta = [];
	hp.DomUtils.getElementById('main-content', handler.dom).children.forEach(function (node) {
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
			content.push(_parseComment(node));
			return;
		}
		
		buffer.push(_text(node));
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
		}
	});
	
	if (raw)
		result.raw = data.body;
	
	return result;
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
	
	getPostUrl: function (board, post) {
		var url = "http://www.ptt.cc/bbs/" + board + "/" + post + ".html"
		jar.setCookie(cookie, url);
		return {
			url: url,
			jar: jar,
			board: board,
			post: post
		};
	},
	
	getPost: function (board, post, options, callback) {
		options = options || {};
		var url = util.getPostUrl(board, post);
		return request(url, function (error, response, body) {
			callback(error, _parsePostResponse({
				url: url,
				response: response,
				body: body
			}, options.raw));
		});
	}
	
};

var board = function (board, options) {
	var end = options.end || 1,
		count = options.limit;
	return new PageCrawlingStream({
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
		parse: function (current, result, push) {
			// TODO: enhance to gather more information: comment count, status, etc.
			var lines = result.body.replace(/(\t)+/g).split('\n'),
				ret1, ret2, ret3,
				href, title, post, author;
			lines.forEach(function (line) {
				ret1 = /a href="([^"]+)">(.+)<\/a>\s*$/.exec(line);
				ret2 = /<div class="author">([^<]+)</.exec(line);
				if (!ret1 && !ret2) {
					return;
				}
				if (ret1) {
					href = ret1[1];
					title = ret1[2];
					ret3 = /\/([^/]+)\.html$/.exec(href);
					if (ret3)
						post = ret3[1];
				}
				if (ret2) {
					author = ret2[1];
				}
				if (author && post) {
					push({
						board: board,
						author: author,
						post: post,
						title: title,
						href: href
					});
					author = post = title = href = null;
				}
			});
		}
	});
};

var post = function (options) {
	return map(function (data, callback) {
		util.getPost(data.board, data.post, options, callback);
	});
};

module.exports = {
	board: board,
	post: post,
	util: util
};
