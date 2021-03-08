const gulp = require('gulp');
const less = require('gulp-less');

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */

const SATASUPE_LESS = ["styles/*.less"];
function compileLESS() {
  return gulp.src("styles/satasupe.less")
    .pipe(less())
    .pipe(gulp.dest("./styles/"))
}
const css = gulp.series(compileLESS);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
  gulp.watch(SATASUPE_LESS, css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
  gulp.parallel(css),
  watchUpdates
);
exports.css = css;
