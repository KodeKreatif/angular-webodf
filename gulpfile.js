var gulp    = require("gulp");
var concat  = require("gulp-concat");
var shell = require("gulp-shell");
var files = require("./files");

var webodfVersion = "0.5.4";

gulp.task("webodf", shell.task([
  "mkdir -p ./vendor/webodf",
  "cd ./vendor/webodf;wget -c http://webodf.org/download/webodf.js-VERSION.zip;unzip webodf.js-VERSION.zip".replace(/VERSION/g, webodfVersion),
  "mv ./vendor/webodf/webodf.js-VERSION/webodf.js ./vendor/webodf/".replace(/VERSION/g, webodfVersion)
]));

gulp.task("src", function() {
  gulp.src(files.src)
  .pipe(concat("angular-webodf.js"))
  .pipe(gulp.dest("./dist/"))
});

gulp.task("demo-libs", function() {
  gulp.src(files["demo-libs"])
  .pipe(concat("libs.js"))
  .pipe(gulp.dest("./demo/"))
});

gulp.task("demo", ["demo-libs", "src"], function() {
  gulp.src("./dist/angular-webodf.js")
  .pipe(gulp.dest("./demo/"))
});

gulp.task("default", [
    ]);
