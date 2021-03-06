require('babel-register');

const path = require('path');
const gulp = require('gulp');
const argv = require('yargs').argv;

const nodemon = require('nodemon');
const rsync = require('gulp-rsync');
const rimraf = require('rimraf');

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');

const commonConfig = require('./webpack/common.webpack.config.js');
const backendConfig = require('./webpack/backend.webpack.config.js');
const frontendConfig = require('./webpack/frontend.webpack.config.js');
const devServerConfig = frontendConfig.devServer;

function onBuild (cb) {
	return (err, stats) => {
		if (err) console.log(err);
		if (stats) {
			console.log(stats.toString({
				colors: true,

				chunk: false,
				chunkModules: false,
				children: false,

				modules: false
			}));
		}

		if (cb) cb();
	};
}

gulp.task('default', ['start']);

gulp.task('start', ['watch:frontend', 'watch:backend'], () => {
	if (process.env.npm_lifecycle_event) {
		nodemon({
			execMap: { js: 'node' },
			ignore: ['*'],
			script: path.resolve('./build/server.js')
		});
	} else {
		console.log('Run "npm start" instead...');
	}
});
gulp.task('clean:dist', () => {
	return rimraf.sync(path.resolve('./dist'));
});
gulp.task('clean:build', () => {
	return rimraf.sync(path.resolve('./build'));
});
gulp.task('clean:all', ['clean:dist', 'clean:build']);

gulp.task('watch:frontend', () => {
	new webpackDevServer(
		webpack(frontendConfig),
		devServerConfig
	).listen(devServerConfig.port, 'localhost', onBuild());
});
gulp.task('watch:backend', () => {
	webpack(backendConfig).watch(backendConfig.watchOptions, onBuild(() => {
		nodemon.restart();
	}));
});
gulp.task('watch', ['watch:frontend', 'watch:backend']);

gulp.task('build:frontend', (done) => {
	webpack(frontendConfig).run(onBuild(done));
});
gulp.task('build:backend', (done) => {
	webpack(backendConfig).run(onBuild(done));
});

gulp.task('build', ['build:frontend', 'build:backend']);

gulp.task('upload', ['clean:dist', 'build'], () => {
	if (commonConfig.SOURCE === 'production' && !argv.force) {
		console.log('Are you sure you want to upload to main? If so, run "yarn deploy:production -- --force"');
		return false;
	}

	const src = ['dist/**/*', './package.json'];

	const dest = commonConfig.SOURCE === 'production' ? 'main' : 'stage';

	return gulp.src(src)
		.pipe(rsync({
			root: '',
	// 		hostname: 'admin@domain.com',
			destination: '../../var/www/' + dest,
			archive: true,
			compress: true,
			progress: true
		}));
});
