var util = require('util'),
	request = require('request'),
	PageCrawlingStream = require('./stream/page-crawling-stream'),
	map = require('./map');

var jar = request.jar(),
	cookie = request.cookie("over18=1"),
	request = request.defaults({jar: jar});

var _parseArticleResponse = function (data) {
	var url = data.url,
		response = data.response,
		body = data.body;
	// TODO: enhance this
	return {
		board: url.board,
		key: url.article,
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
	
	getArticleUrl: function (board, key) {
		var url = "http://www.ptt.cc/bbs/" + board + "/" + key + ".html"
		jar.setCookie(cookie, url);
		return {
			url: url,
			jar: jar,
			board: board,
			article: article
		};
	},
	
	getArticle: function (board, key, callback) {
		var url = util.getArticleUrl(board, key);
		return request(url, function (error, response, body) {
			callback(error, _parseArticleResponse({
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
				npage = pageNum && pageNum - 1,
				ret;
			
			if (npage == null) {
				ret = /\s+href=".+\/index(\d+)\.html">&lsaquo; 上頁<\/a>/
					.exec(result.body.replace(/[\r\n]/g, ""));
				npage = ret && parseInt(ret[1], 10);
			}
			
			return (!npage || npage < end || (count != null && --count < 1)) ? 
				null : util.getBoardUrl(board, npage);
		},
		parse: function (current, result, push) {
			// TODO: enhance to gather more information: comment count, status, etc.
			var lines = result.body.replace(/(\t)+/g).split('\n'),
				ret1, ret2, ret3,
				href, title, key, author;
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
						key = ret3[1];
				}
				if (ret2) {
					author = ret2[1];
				}
				if (author && key) {
					push({
						board: board,
						author: author,
						key: key,
						title: title,
						href: href
					});
					author = key = title = href = null;
				}
			});
		}
	});
};

var article = function (options) {
	return map(function (data, callback) {
		util.getArticle(data.board, data.key, callback);
	});
};

module.exports = {
	board: board,
	article: article,
	util: util
};
