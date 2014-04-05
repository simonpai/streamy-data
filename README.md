streamy-data
=========

Inspired by [gulp.js](http://gulpjs.com/), this library helps you work on data collection in the form of [Node Stream](http://nodejs.org/api/stream.html) (in object mode). If you are not familiar with gulp.js, here is an introduction:

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

```bash
npm install streamy-data
```

# Usage

```js
var streamy = require('streamy-data');

streamy.ptt.board('food', { limit: 2 }) // start with a readable stream which emits post URLs
	.pipe(streamy.ptt.post()) // a transform stream which map the URL to post content
	.pipe(streamy.echo()) // prints stream content to console.log, and passes the data through
	.on('data', function (data) {
		// or do something in an explicit handler
	})
	.on('end', function () {
		// or do something when the stream ends
		console.log('= END =');
	});
```

# API

###streamy.array(array)

Return a readable string which iterates through the array.

```js
streamy.array(['A', 'B', 'C'])
	.pipe(streamy.echo());
```

####array
Type: `Array`

The source array.

###streamy.echo([map, where])

Return a pass-through stream (which doesn't modify data) that prints out its content to console.

```js
gulp.src(['*.js'])
	.pipe(streamy.echo());
```

####map
Type: `Function: * -> *`

Transform printed data, if specified.

####where
Type: `Function: * -> boolean`

Filter printed data, if specified.

###streamy.map(func)

Return an asynchronous transform stream.

```js
someReadableStream
	.pipe(streamy.map(function (data, callback) {
		// do something
		if (error) {
			callback(error);
			return;
		}
		// do something
		callback(null, data);
	}))
	.pipe(streamy.echo());
```

####func
Type: `Function`

The transform function.

###streamy.map.sync(func)

The synchronous version of `streamy.map`.

```js
someReadableStream
	.pipe(streamy.map.sync(function (data) {
		// do something
		return data;
	}))
	.pipe(streamy.echo());
```

####func
Type: `Function: * -> *`

The transform function.

###streamy.http()

Return a transform stream which maps input to the result of its http request. 

Input format:

See the first parameter of [npm request](https://github.com/mikeal/request).

Output format:

```js
{
	url: (input url),
	response: (the response object),
	body: (html body string)
}
```

###streamy.ptt.board(name, [options])

Return a readable stream which emits post links in the PTT board, in descending order.

```js
streamy.ptt.board('food', { limit: 2 })
	.pipe(streamy.echo());
```

Output format:

```js
{
	board: (board name string),
	author: (author id string),
	post: (post id string),
	title: (post title string),
	href: (post link url string)
}
```

####name

The board name.

####options.start

The start page index (high, inclusive).

####options.end

The end page index (low, exclusive).

####options.limit

The number of pages to scrape. When limit and end are both specified, both conditions are respected.

###streamy.ptt.post(options)

Return a transform stream which maps board-post pair to post content.

Input format: (compatible with `streamy.ptt.board()` output)
```js
{
	board: (board name string),
	post: (post id string)
}
```

Output format:
```js
{
	board: (board name string),
	post: (post id string),
	title: (post title string),
	raw: (the html body string),
	meta: [
		{ tag: '作者', value: ... },
		{ tag: '站內', value: ... },
		{ tag: '標題', value: ... },
		{ tag: '時間', value: ... }
	],
	content: [
		(content),
		{ type: comment, subtype: (1/2/3), author: ..., content: ... },
		{ type: comment, subtype: (1/2/3), author: ..., content: ... }
		...
	]
}
```

```js
streamy.ptt.board('food', { limit: 2 })
	.pipe(streamy.ptt.post())
	.pipe(streamy.echo())
```

####options.raw
Type: `boolean`, default: `false`

The `raw` field is included in the output if the value true.

# See also
* [streamy-couch](https://github.com/simonpai/streamy-couch): work with Couchbase in Stream.
