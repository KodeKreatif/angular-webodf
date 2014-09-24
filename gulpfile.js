var gulp    = require("gulp");
var concat  = require("gulp-concat");
var shell = require("gulp-shell");
var files = require("./files");
var karma = require("karma").server;
var less = require("gulp-less");
var replace = require("gulp-replace");

var webodfVersion = "0.5.4";

gulp.task("webodf", shell.task([
  "mkdir -p ./vendor/webodf",
  "cd ./vendor/webodf;wget -c http://webodf.org/download/webodf.js-VERSION.zip;unzip -n webodf.js-VERSION.zip".replace(/VERSION/g, webodfVersion),
  "mv ./vendor/webodf/webodf.js-VERSION/webodf.js ./vendor/webodf/".replace(/VERSION/g, webodfVersion)
]));

gulp.task("rulers", shell.task([
    "mkdir -p ./vendor/Rulers",
    "cd ./vendor/Rulers;wget -c https://github.com/psychobunny/Rulers/archive/master.zip;unzip -n master.zip; cp Rulers-master/src/rulers.js .",
  ]));

gulp.task("clean", function() {
  return shell.task([
      "rm -f ./demo/libs.js",
      "rm -f ./demo/fonts",
      "rm -f ./demo/angular-webodf.js",
      "rm -rf ./dist"
  ])
})

gulp.task("fa-less", function() {
  return gulp.src(files["fa-less"])
  .pipe(concat("fa.less"))
  .pipe(replace("@fa-font-path:        \"../fonts\";", "@fa-font-path: './fonts';"))
  .pipe(less())
  .pipe(gulp.dest("./dist/"))
});

gulp.task("fa-fonts", function() {
  return gulp.src(files["fa-fonts"])
  .pipe(gulp.dest("./dist/fonts"))
});

gulp.task("fa", ["fa-less", "fa-fonts"], function() {
});

gulp.task("src", ["rulers"],function() {
  return gulp.src(files.src)
  .pipe(concat("angular-webodf.js"))
  .pipe(gulp.dest("./dist/"))
});

gulp.task("demo-styles", function() {
  gulp.src(files["demo-styles"])
  .pipe(concat("styles.css"))
  .pipe(gulp.dest("./demo/"))
});

gulp.task("demo-libs", function() {
  gulp.src(files["demo-libs"])
  .pipe(concat("libs.js"))
  .pipe(gulp.dest("./demo/"))
});

gulp.task("demo", ["clean", "webodf", "fa", "demo-styles", "demo-libs", "src"], function() {
  gulp.src("./dist/angular-webodf.js")
  .pipe(gulp.dest("./demo/"))

  gulp.src("./dist/fonts/*")
  .pipe(gulp.dest("./demo/fonts"))
});


gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('tdd', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js'
  }, done);
});


gulp.task("default", [
    ]);
