var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');

var config = {
    src: './src',
    dist: './lib'
};

function gulpBuild(source) {
  return gulp.src(source, { base : config.src })
    .pipe(sourcemaps.init())
    .pipe(babel({
      compact: true,
      comments: false,
      blacklist: ['regenerator'],
      optional: ['asyncToGenerator', 'runtime']
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.dist));
}

gulp.task('build', function() {
  return gulpBuild(config.src + '/**/*.js');
});

gulp.task('watch', function() {
  return gulp.watch(config.src + '/**/*.js', function(fileStatus) {
    var path = fileStatus.path.replace(__dirname, '');
    console.log('[ES6 watcher] ' + path + ' (' + fileStatus.type + ')');
    return gulpBuild(fileStatus.path);

  });
});
