const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');


// TODO: Look over the usage of webpack dev server and the passing of variables. Prehaps we don't need to use it in gulp anymore but rather implement it in "server.js" (as all the cool kids does). The down side is that we need to import the webpack files, but perhaps it is an effort worth doing in order to be able to pass variables from the database into it.
// TODO: Check into the usage of Redux, it might be worth doing now from the start. The downside with it is that it would also be fitting to check the Immutable.js library and functional programming at the same time, but this takes alot of time.

const ports = {
	dev: 7000,
	prod: 8080
};

const args = process.env.npm_lifecycle_event || '';
const isDev = !args || (['start', 'build:dev'].indexOf(args) !== -1 && !process.env.npm_config_optimize);

const NODE_ENV = isDev ? 'development' : 'production';
const NODE_SOURCE = args.indexOf('stage') !== -1 ? 'stage' : args.indexOf('production') !== -1 ? 'production' : 'local'; // eslint-disable-line
// const NODE_SERVER_RENDERING = !isDev; //TODO: Change this
const NODE_SERVER_RENDERING = true;

console.log('[args, env, source, is-dev]', args, NODE_ENV, NODE_SOURCE, isDev);

const common = {
	ports: ports,
	ENV: NODE_ENV,
	SOURCE: NODE_SOURCE,
	IS_DEV: isDev,
	config: {
		output: {
			path: path.resolve(NODE_ENV === 'production' ? 'dist' : 'build', 'static'),
			publicPath: '/static/'
		},
		module: {
			rules: [
				{
					test: /\.js?$/,
					exclude: /node_modules/,
					use: 'babel-loader'
				},
				{
					test: /\.json?$/,
					use: 'json-loader'
				},
				{
					test: /\.txt$/,
					use: 'raw-loader',
				},
				{
					test: /\.(woff|woff2|eot|ttf)$/,
					use: 'file-loader?name=font/[name].[ext]'
				},
				{
					test: /\.pdf$/,
					use: 'file-loader?name=documents/[name].[ext]'
				}
			]
		},

		resolve: {
			alias: {
				// GENERAL FOLDERS
				app: path.resolve('./app'),
				server: path.resolve('./server'),
				static: path.resolve('./static'),

				// SERVER
				database: path.resolve('./server/misc/database'),
				'server-helper': path.resolve('./server/misc/helper'),
				'server-globals': path.resolve('./server/misc/globals'),

				modules: path.resolve('./server/modules'),

				// APP
				component: path.resolve('./app/components'),
				components: path.resolve('./app/components/components.js'),

				container: path.resolve('./app/containers'),
				containers: path.resolve('./app/containers/containers.js'),

				globals: path.resolve('./app/misc/globals.js'),
				helper: path.resolve('./app/misc/helper'),

				images: path.resolve('./static/images'),
				documents: path.resolve('./static/documents'),
				fonts: path.resolve('./static/fonts'),
			}
		},

		plugins: [
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: JSON.stringify(NODE_ENV),
					NODE_IS_DEV: JSON.stringify(isDev),
					NODE_SOURCE: JSON.stringify(NODE_SOURCE),
					NODE_PORT: JSON.stringify(isDev ? ports.dev : ports.prod),
					NODE_SERVER_RENDERING: JSON.stringify(NODE_SERVER_RENDERING)
				}
			})
		],

		devtool: isDev ? 'source-map' : undefined,

		stats: {
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
		},

		watchOptions: {
			aggregateTimeout: 300,
			// poll: true
		},
	}
};

common.config = merge.smart(common.config, getEnvConfig(), getSourceConfig());

module.exports = common;


function getEnvConfig () {
	if (isDev) {
		return {
			module: {
				rules: [
					{
						test: /\.css$/,
						use: ExtractTextPlugin.extract({
							fallback: 'style-loader',
							use: 'css-loader?minimize'
						})
					},
					{
						test: /\.scss$/,
						use: ExtractTextPlugin.extract({
							fallback: 'style-loader',
							use: 'css-loader?minimize&modules&camelCase&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]!sass-loader'
						})
					}
				]
			},
			plugins: [
				new ExtractTextPlugin({
					filename: 'styles/styles.css',
					disable: false,
					allChunks: true
				})
			]
		};
	}

	return {
		module: {
			rules: [
				{
					test: /\.css$/,
					use: ExtractTextPlugin.extract({
						fallback: 'style-loader',
						use: 'css-loader?minimize'
					})
				},
				{
					test: /\.scss$/,
					use: ExtractTextPlugin.extract({
						fallback: 'style-loader',
						use: 'css-loader?minimize&modules&camelCase=dashes&importLoaders=1&localIdentName=[hash:base64:5]!sass-loader'

					})
				}
			]
		},
		plugins: [
			new ExtractTextPlugin({
				filename: '/styles/styles.[hash].css',
				disable: false,
				allChunks: true
			}),
			new webpack.optimize.UglifyJsPlugin(),
			new webpack.LoaderOptionsPlugin({
				minimize: true,
				debug: false
			})
		]
	};
}
function getSourceConfig () {
	if (NODE_SOURCE === 'production') {
		return {
			module: {
				rules: [
					{
						test: /\.(jpe?g|png|gif|svg|ico)$/i,
						use: [
							'file-loader?hash=sha512&digest=hex&name=images/[name].[hash].[ext]',
							'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
						]
					}
				]
			}
		};
	}

	return {
		module: {
			rules: [
				{
					test: /\.(jpe?g|png|gif|svg|ico)$/i,
					use: [
						'file-loader?name=images/[name].[hash].[ext]'
					]
				}
			]
		}
	};
}
