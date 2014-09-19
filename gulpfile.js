var gulp    = require("gulp");
var concat  = require("gulp-concat");
var shell = require("gulp-shell");

var webodfVersion = "0.5.4";

gulp.task("webodf", shell.task([
  "mkdir -p ./vendor/webodf",
  "cd ./vendor/webodf;wget -c http://webodf.org/download/webodf.js-VERSION.zip;unzip webodf.js-VERSION.zip".replace(/VERSION/g, webodfVersion),
  "mv ./vendor/webodf/webodf.js-VERSION/webodf.js ./vendor/webodf/".replace(/VERSION/g, webodfVersion)
]));

gulp.task("default", [
    ]);
