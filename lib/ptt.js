var util = require('util'),
	request = require('request'),
	PageCrawlingStream = require('./stream/page-crawling-stream'),
	map = require('./map');

var jar = request.jar(),
	cookie = request.cookie("over18=1"),
	request = request.defaults({jar: jar});

var _parsePostResponse = function (data) {
	var url = data.url,
		response = data.response,
		body = data.body;
	// TODO: enhance this
	return {
		board: url.board,
		post: url.post,
		raw: data.body
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
	
	getPost: function (board, post, callback) {
		var url = util.getPostUrl(board, post);
		return request(url, function (error, response, body) {
			callback(error, _parsePostResponse({
				url: url,
				response: response,
				body: body
			}));
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
		util.getPost(data.board, data.post, callback);
	});
};

module.exports = {
	board: board,
	post: post,
	util: util
};
