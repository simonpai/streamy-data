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
	
	return array(['http://www.google.com', 'http://www.yahoo.com'])
		.pipe(chop.request())
		.pipe(chop.echo());
	
});
*/