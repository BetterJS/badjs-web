var gulp = require("gulp");
var del = require('del');
var webpack = require("webpack");


gulp.task('clean', function(cb) {
    del(['public'], cb);
});

gulp.task('default', function() {

});



gulp.task("webpack", function(callback) {


    // run webpack
    webpack({

    }, function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            // output options
        }));
        callback();
    });
});