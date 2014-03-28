var gulp = require('gulp'),
	mocha = require('gulp-mocha');

/*
var array = require('stream-array'),
	chop = require('./index');
*/

gulp.task('default', ['build', 'test']);

gulp.task('build', function() {
	
});

gulp.task('test', function() {
	
	return gulp.src(['test/*.js'])
		.pipe(mocha({ reporter: 'dot' }));
	
});

/*
gulp.task('demo', function() {
	
	chop.ptt.util.currentPageIndex('Gossiping', function (err, index) {
		chop.count({start: index, step: -1, end: index - 10})
			.pipe(chop.echo());
	});
	
});
*/
