streamy-data
=========

Inspired by [gulp.js](http://gulpjs.com/), this library helps you work on data collection in the form of [Node Stream](http://nodejs.org/api/stream.html). If you are not familiar with gulp.js, here is an introduction:

[No Need To Grunt, Take A Gulp Of Fresh Air](http://travismaynard.com/writing/no-need-to-grunt-take-a-gulp-of-fresh-air)

The pros of this approach are similar to gulp.js:
* Leverage the power of Stream.
	* No intermidiate file I/O.
	* Highly granular plugin functions.
	* Straightforward spec. (They're just object mode streams.)
* More code, less config.

The cons are:
* Require basic knowledge of Stream.

# Install

# Usage

```js
var sdata = require('streamy-data');

sdata.ptt.board('food', { limit: 2 }) // start with a readable stream which emits post URLs
	.pipe(sdata.ptt.post()) // a transform stream which map the URL to post content
	.pipe(sdata.echo()) // prints stream content to console.log, and passes the data through
	.on('data', function () {})
	.on('end', function () {
		console.log('= END =');
	});
```

# API

# See also
* [streamy-couch](https://github.com/simonpai/streamy-couch): work with Couchbase in Stream.
