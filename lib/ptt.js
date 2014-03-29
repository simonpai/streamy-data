var map = require('./map'),
	request = require('request'),
	requestStream = require('./request'),
	PageCrawlingStream = require('./page-crawling-stream'),
	util = require('util');

var jar = request.jar(),
	cookie = request.cookie("over18=1"),
	request = request.defaults({jar: jar});

var getUrl = function (board, page) {
	var url = "http://www.ptt.cc/bbs/" + board + "/index" + (page != null ? page : "") + ".html"
	jar.setCookie(cookie, url);
	return {
		url: url,
		jar: jar,
		board: board,
		page: page
	};
}

var list = function (board, options) {
	var end = options.end || 1,
		count = options.limit;
	return new PageCrawlingStream({
		start: getUrl(board, options.start),
		step: function (current, result) {
			var board = current.board,
				page = current.page,
				npage = page && page - 1,
				ret;
			
			if (npage == null) {
				ret = /\s+href=".+\/index(\d+)\.html">&lsaquo; 上頁<\/a>/
					.exec(result.body.replace(/[\r\n]/g, ""));
				npage = ret && parseInt(ret[1], 10);
			}
			
			return (!npage || npage < end || (count != null && --count < 1)) ? 
				null : getUrl(board, npage);
		},
		parse: function (current, result, push) {
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

var getArticle = function (board, id, callback) {
	
};

var parse = function (data) {
	
};

module.exports = {
	list: list,
	util: {
		getArticle: getArticle
		//currentPageIndex: currentPageIndex
	}
};
