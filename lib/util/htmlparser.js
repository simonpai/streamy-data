var htmlparser0 = require('htmlparser');

htmlparser0.DomUtils.getElementsByClass = function (className, dom) {
	return htmlparser0.DomUtils.getElements({
		class: function (value) {
			value = ' ' + (value == null ? '' : value) + ' ';
			return value.indexOf(' ' + className + ' ') > -1;
		}
	}, dom);
};

module.exports = htmlparser0;