"use strict";

// パッケージの取り込み
const gulp = require("gulp");
const sassc = require("gulp-sass");
const pugc = require("gulp-pug");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const webpackConfig = require("./webpack.config.js");
const del = require("del");
const browserSync = require("browser-sync");
const htmlmin = require("gulp-html-minifier");
const csso = require("gulp-csso");
const webpackConfigBuild = require("./webpack.config.build.js");
const uglify = require("gulp-uglify");

// gulp周りのメソッドを横着するやつ
const { task, src, dest, watch, series, parallel } = gulp;

// リソースと出力先のパス
const PATHS = {
    DEST_ROOT: "./dist/**/*",
    PUG: {
        SRC: "src/*.pug",
        DEST: "dist/"
    },
    SCSS: {
        SRC: "src/scss/*.scss",
        DEST: "dist/css/"
    },
    TS: {
        SRC: "src/ts/*.ts",
        DEST: "dist/js/"
    }
};

// pugのコンパイル
const pug = _ => {
    return src(PATHS.PUG.SRC)
        .pipe(pugc({
            pretty: true
        }))
        .pipe(dest(PATHS.PUG.DEST));
};

// pugのビルドコンパイル
const pug_build = _ => {
    return src(PATHS.PUG.SRC)
        .pipe(pugc())
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest(PATHS.PUG.DEST));
};

// scssのコンパイル
const scss = _ => {
    return src(PATHS.SCSS.SRC)
        .pipe(sassc())
        .pipe(dest(PATHS.SCSS.DEST))
};

// scssのビルドコンパイル
const scss_build = _ => {
    return src(PATHS.SCSS.SRC)
        .pipe(sassc())
        .pipe(csso())
        .pipe(dest(PATHS.SCSS.DEST));
};

// tsのコンパイル
const ts = _ => {
    return webpackStream(webpackConfig, webpack)
        .pipe(dest(PATHS.TS.DEST));
};

// tsのビルドコンパイル
const ts_build = _ => {
    return webpackStream(webpackConfigBuild, webpack)
        .pipe(uglify())
        .pipe(dest(PATHS.TS.DEST));
};

// browsersyncの実行
const browsersync = done => {
    browserSync.init({
        port: 8000,
        ui: {
            port: 8001
        },
        server: {
            baseDir: "./dist",
            index: "index.html"
        },
        ghostMode: {
            clicks: false,
            scroll: false,
            location: false,
            forms: false
        },
        reloadOnRestart: true
    });
    done();
};

// ファイル更新検知とbrowsersyncのリロード
const watchSrc = done => {
    const browserReload = _ => {
        browserSync.reload();
        done();
    };
    watch(PATHS.PUG.SRC).on("change", series(pug, browserReload));
    watch(PATHS.SCSS.SRC).on("change", series(scss, browserReload));
    watch(PATHS.TS.SRC).on("change", series(ts, browserReload));
};

// デフォルトタスク、ファイルの更新を検知しつつ、browsersyncで監視
task("default", series(parallel(pug, scss, ts), series(browsersync, watchSrc)));

// ビルドタスク、minifyしたコードを吐き出す
task("build", series(pug_build, scss_build, ts_build));

// 出力先のクリーンアップ、ぶっちゃけいらないかも
task("clean", _ => del([PATHS.DEST_ROOT]));
