/**
 * gulpfile.js
 * Created by Huxley on 7/15/16.
 */
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    webpack = require('webpack'),
    webpackDevServer = require('webpack-dev-server'),
    autoprefixer = require('autoprefixer'),
    del = require('del'),
    git = require('gulp-git');

function build(env) {
    if (!['production', 'development'].some(function(v) { return v === env; })) {
        console.log('bad build argument: ' + env);
        return;
    }
    gulp.src('src/*.html').pipe(gulp.dest('build'));
    var compiler = webpack({
        entry: "./src/main.js",
        output: {
            path: require('path').resolve('./build/'),
            filename: 'bundle.js'
        },
        watch: env === 'development',
        module: {
            loaders: [
                {
                    test: /\.(svg|png)$/,
                    loader: "file"
                },
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
                ret.push(new webpack.DefinePlugin({
                    "process.env": {
                        "NODE_ENV": JSON.stringify("production")
                    }
                }));
            }
            return ret;
        })(),
    });
    if ('development' === env) {
        new webpackDevServer(compiler, {
            hot: true,
            contentBase: './build/'
        }).listen(8080, "localhost", function (err) {
            if (err) throw new gutil.PluginError("webpack-dev-server", err);
        });
    } else {
        compiler.run(function(err, stats) {
            // TODO
        });
    }
}

gulp.task('clean', function() {
    return del.sync(['build/*', '!build/data']);
});

gulp.task('release', ['clean'], function() {
    return build('production');
});

gulp.task('debug', ['clean'], function () {
    return build('development');
});

gulp.task('publish', ['release'], function() {
    gulp.src('./build/*').pipe(gulp.dest('/tmp/build/'));
    git.checkout('gh-pages', function(err) {
        if (err) throw err;
        gulp.src('/tmp/build/*').pipe(gulp.dest('./'));
        gulp.src('./*').pipe(git.commit('auto commit', {emitData: true})).
        on('data', function(data) {
            console.log(data);
            git.push('origin/gh-pages', 'gh-pages', function(err) {
                if (err) throw err;
                git.checkout('master', function(err) {
                    if (err) throw err;
                    del.sync('/tmp/build');
                    console.log('Auto commit completed.');
                })
            })
        });
    })
});
