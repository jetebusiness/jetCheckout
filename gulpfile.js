const   gulp = require("gulp"),
        rename = require("gulp-rename"),
        uglify = require("gulp-uglify"),
        qunit = require("gulp-qunit"),
        pump = require("pump"),
        babel = require("gulp-babel"),
        sourcemaps = require("gulp-sourcemaps");

const dist = "dist",
      src = "src",
      test = "test";

gulp.task("default", function(cb) {
    pump([
        gulp.src(src+"/*.js"),
        sourcemaps.init(),
        babel({presets: ["env"]}),
        gulp.dest(dist),
        uglify(),
        rename({ extname: ".min.js" }),
        sourcemaps.write("."),
        gulp.dest(dist)
    ], cb);

});

gulp.task("test", function() {
    return gulp.src(test+"/jetcheckout.html")
        .pipe(qunit());
});