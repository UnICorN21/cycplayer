/**
 * gulpfile.js
 * Created by Huxley on 7/15/16.
 */
var gulp = require('gulp'),
    webpackStream = require('webpack-stream'),
    webpack = require('webpack'),
    autoprefixer = require('autoprefixer'),
    del = require('del');

function build(env) {
    if (!['production', 'development'].some(v => v == env)) {
        console.log('bad build argument: ' + env);
        return;
    }
    gulp.src('src/*.html').pipe(gulp.dest('build'));
    return gulp.src('src/main.js')
        .pipe(webpackStream({
            output: {
                filename: 'bundle.js'
            },
            watch: env === 'development',
            module: {
                loaders: [
                    {
                        test: /\.scss$/,
                        loader: "style!css!postcss-loader!sass"
                    },
                    {
                        test: /\.jsx?$/,
                        loader: 'babel',
                        exclude: /node_modules/,
                    }
                ]
            },
            postcss: function() {
                return [autoprefixer];
            },
            devtool: env === 'development' ? 'source-map' : '',
            plugins: (function() {
                var ret = [
                    new webpack.NoErrorsPlugin()
                ];
                if ('development' === env) {
                    ret.push(new webpack.HotModuleReplacementPlugin());
                } else {
                    ret.push(new webpack.optimize.DedupePlugin());
                    ret.push(new webpack.optimize.UglifyJsPlugin());
                }
                return ret;
            })()
        }))
        .pipe(gulp.dest('build'));
}

gulp.task('clean', function() {
    return del.sync('build/*');
});

gulp.task('release', ['clean'], function() {
    return build('production');
});

gulp.task('debug', ['clean'], function () {
    return build('development');
});
