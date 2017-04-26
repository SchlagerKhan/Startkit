import {includes} from 'lodash';

const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const DirectoryNamedWebpackPlugin = require('directory-named-webpack-plugin');
const argv = require('yargs').argv;

// TODO: Check into the usage of Redux, it might be worth doing now from the start. The downside with it is that it would also be fitting to check the Immutable.js library and functional programming at the same time, but this takes alot of time.

const ports = {
	dev: 7000,
	production: 8080,
};

const {IS_DEV, NODE_ENV, NODE_SOURCE, NODE_PORT} = getEnv();

if (!includes(argv._[0], 'clean')) {
	console.log(
		`
		NODE_ENV: ${NODE_ENV}
		NODE_SOURCE: ${NODE_SOURCE}
		NODE_IS_DEV: ${IS_DEV}
	`
	);
}

const common = {
	ports: ports,
	NODE_ENV,
	NODE_SOURCE,
	IS_DEV,
	config: {
		output: {
			path: path.resolve(IS_DEV ? 'build' : 'dist', 'static'),
			publicPath: '/static/',
		},
		module: {rules: getRules()},
		plugins: getPlugins(),
		devtool: IS_DEV ? 'source-map' : undefined,

		stats: getStats(),
		watchOptions: {aggregateTimeout: 300},
	},
};

common.config = merge.smart(common.config, getEnvConfig(), getSourceConfig());

// console.log(common.config.module);

module.exports = common;

function getEnv() {
	const isDev = !!argv.dev;
	const nodeEnv = isDev ? 'development' : 'production';
	const nodeSource = argv.source;
	const port = isDev ? ports.dev : ports.production;

	if (!includes([undefined, 'production', 'stage', 'local'], nodeSource)) {
		throw new Error(`No such source: ${nodeSource}`);
	}

	return {
		IS_DEV: isDev,
		NODE_ENV: nodeEnv,
		NODE_SOURCE: nodeSource,
		NODE_PORT: port,
	};
}

function getEnvConfig() {
	if (IS_DEV) {
		return {
			plugins: [
				new ExtractTextPlugin({
					filename: 'styles/styles.css',
					disable: false,
					allChunks: true,
				}),
			],
		};
	}

	return {
		plugins: [
			new ExtractTextPlugin({
				filename: '/styles/styles.[hash].css',
				disable: false,
				allChunks: true,
			}),
			new webpack.LoaderOptionsPlugin({
				minimize: true,
				debug: false,
			}),
		],
	};
}
function getSourceConfig() {
	const imgTest = /\.(jpe?g|png|gif|svg|ico)$/i;

	if (NODE_SOURCE === 'production') {
		return {
			module: {
				rules: [
					{
						test: imgTest,
						use: [
							{
								loader: 'file-loader',
								query: {
									hash: 'sha512',
									digest: 'hex',
									name: 'images/[name].[hash].[ext]',
								},
							},
							{
								loader: 'image-webpack-loader',
								query: {
									bypassOnDebug: true,
									mozjpeg: {progressive: true},
									gifsicle: {interlaced: false},
									optipng: {optimizationLevel: 7},
									pngquant: {quality: '65-80', speed: 3},
								},
							},
						],
					},
				],
			},
		};
	}

	return {
		module: {
			rules: [
				{
					test: imgTest,
					use: {
						loader: 'file-loader',
						query: {
							name: 'images/[name].[hash].[ext]',
						},
					},
				},
			],
		},
	};
}

function getRules() {
	const cssLoader = {
		test: /\.css$/,
		use: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: {
				loader: 'css-loader',
				query: {
					minimize: true,
				},
			},
		}),
	};
	const scssNameFormat = IS_DEV
		? '[name]__[local]___[hash:base64:5]'
		: '[hash:base64:5]';
	const scssLoader = {
		test: /\.scss$/,
		use: ExtractTextPlugin.extract({
			fallback: 'style-loader',
			use: [
				{
					loader: 'css-loader',
					query: {
						minimize: true,
						modules: true,
						camelCase: 'dashes',
						importLoaders: 1,
						localIdentName: scssNameFormat,
					},
				},
				{
					loader: 'sass-loader',
					options: {
						includePaths: [path.resolve('./app/sass')],
					},
				},
			],
		}),
	};

	return [
		{
			test: /\.js?$/,
			exclude: /node_modules/,
			use: 'babel-loader',
		},
		{
			test: /\.json?$/,
			use: 'json-loader',
		},
		{
			test: /\.txt$/,
			use: 'raw-loader',
		},
		{
			test: /\.(woff|woff2|eot|ttf)$/,
			use: 'file-loader?name=font/[name].[ext]',
		},
		{
			test: /\.pdf$/,
			use: 'file-loader?name=documents/[name].[ext]',
		},
		cssLoader,
		scssLoader,
	];
}
function getPlugins() {
	return [
		new DirectoryNamedWebpackPlugin(),
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: JSON.stringify(NODE_ENV),
				NODE_IS_DEV: JSON.stringify(IS_DEV),
				NODE_SOURCE: JSON.stringify(NODE_SOURCE),
				NODE_PORT: JSON.stringify(NODE_PORT),
			},
		}),
	];
}
function getStats() {
	return {
		colors: true,

		cached: false,
		chunk: false,
		chunkModules: false,
		chunkOrigins: false,

		children: false,

		modules: false,
		publicPath: false,
		reasons: false,
		source: false,
	};
}
