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
    runSequence = require('run-sequence'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    git = require('gulp-git');

function build(env, cb) {
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
            if (err) throw err;
            if (cb) cb();
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

gulp.task('publish', ['clean'], function() {
    build('production', function() {
        gulp.src(['./*', './gitignore', '!./build', '!./node_modules']).pipe(git.commit('publish'));
        fse.copy('./build', '/tmp/build', function(err) {
            if (err) throw err;
            git.checkout('gh-pages', function(err) {
                if (err) throw err;
                fs.readdir('/tmp/build/', function(err, files) {
                    files.forEach(file =>fse.copySync(path.resolve('/tmp/build', file), path.resolve('./', file)));
                    gulp.src(['./*', './gitignore', '!./build', '!./node_modules']).pipe(git.commit('auto commit', {emitData: true})).
                    on('data', function(data) {
                        console.log(data);
                        git.push('origin/gh-pages', 'gh-pages', function(err) {
                            if (err) throw err;
                            git.checkout('master', function(err) {
                                if (err) throw err;
                                del.sync('/tmp/build');
                                console.log('Auto commit completed.');
                            });
                        });
                    });
                });
            });
        });
    });
});
