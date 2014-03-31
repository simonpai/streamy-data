var gulp = require('gulp'),
	mocha = require('gulp-mocha');

var array = require('stream-array'),
	sdata = require('./index');

gulp.task('default', ['build', 'test']);

gulp.task('build', function() {
	
});

gulp.task('test', function() {
	
	return gulp.src(['test/*.js'])
		.pipe(mocha({ reporter: 'dot' }));
	
});

gulp.task('demo', function() {
	
	return sdata.ptt.board('Gossiping', { limit: 10 })
		.pipe(sdata.ptt.article())
		.pipe(sdata.echo());
	
});
