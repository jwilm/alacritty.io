import auto from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import cp from 'child_process';
import gulp from 'gulp';
import maps from 'gulp-sourcemaps';
import nano from 'gulp-cssnano';
import scss from 'gulp-sass';
import sync from 'browser-sync';
import ugly from 'gulp-uglify';

const JEKYLL = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

const PATHS = {
  css: {
    src:        './_assets/scss/**/*.scss',
    dist:       './css/',
    jekyllSrv:  './_site/css/'
  },
  js: {
    src:        './_assets/js/**/*.js',
    dist:       './js/',
    jekyllSrv:  './_site/js/'
  },
  jekyll: {
    src: ['./index.html', './_includes/*', './_layouts/*', './_pages/*'],
    dest: './_site/'
  }
}

const Build = (done) => {
  return cp.spawn(JEKYLL , ['build'], {stdio: 'inherit'}).on('close', done);
}

const Reload = () => {
  sync.reload();
}

const Serve = () => {
  sync.init({
    server: PATHS.jekyll.dest,
    notify: false
  });
}

const Styles = () => {
  return gulp.src(PATHS.css.src)
    .pipe(maps.init())
    .pipe(scss().on('error', scss.logError))
    .pipe(auto({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(nano())
    .pipe(maps.write(PATHS.css.jekyllSrv))
    .pipe(maps.write(PATHS.css.dist))
    .pipe(gulp.dest(PATHS.css.jekyllSrv))
    .pipe(gulp.dest(PATHS.css.dist))
    .pipe(sync.stream());
}

const Scripts = () => {
  return gulp.src(PATHS.js.src)
    .pipe(maps.init())
    .pipe(babel())
    .pipe(ugly())
    .pipe(maps.write(PATHS.js.jekyllSrv))
    .pipe(maps.write(PATHS.js.dist))
    .pipe(gulp.dest(PATHS.js.jekyllSrv))
    .pipe(gulp.dest(PATHS.js.dist))
    .pipe(sync.stream());
}

const Watch = () => {
  gulp.watch(PATHS.jekyll.src).on('change', gulp.series(Build, Reload));
  gulp.watch(PATHS.css.src).on('change', Styles);
  gulp.watch(PATHS.js.src).on('change', Scripts);
}

gulp.task('default',
  gulp.series(
    Build,
    Styles,
    Scripts,
    gulp.parallel(Serve, Watch)
  )
);
