var htmlparser0 = require('htmlparser');

htmlparser0.DomUtils.getElementsByClass = function (className, dom) {
	return htmlparser0.DomUtils.getElements({
		class: function (value) {
			value = ' ' + (value == null ? '' : value) + ' ';
			return value.indexOf(' ' + className + ' ') > -1;
		}
	}, dom);
};

var _text0 = function (buffer, dom) {
	if (dom.type === 'text')
		buffer.push(dom.data);
	else if (dom.children)
		dom.children.forEach(function (c) { _text0(buffer, c); });
};

htmlparser0.DomUtils.text = function (dom) {
	var buffer = [], str;
	_text0(buffer, dom);
	str = buffer.join('');
	return str[str.length - 1] === '\n' ? str : str + '\n';
};

module.exports = htmlparser0;