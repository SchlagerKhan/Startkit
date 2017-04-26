const path = require('path');
const merge = require('webpack-merge');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./common.webpack.config.js');

const config = {
	plugins: [
		...getHtmlPlugins(),
		new webpack.DefinePlugin({ __IS_BROWSER__: true })
	],

	devServer: {
		port: common.ports.dev + 1,
		contentBase: 'build/',
		publicPath: '/static/',
		historyApiFallback: {
			index: '/static/'
		},
		proxy: {
			'/api': {
				target: 'http://localhost:' + common.ports.dev
			}
		},
		stats: {
			colors: true,
			chunk: false,
			chunkModules: false,
			children: false
		}
	}
};

const mergedConfig = merge.smart(common.config, config, getEnvConfig());

module.exports = mergedConfig;

function getEnvConfig () {
	if (common.IS_DEV) {
		return {
			entry: [
				'webpack-dev-server/client?http://localhost:' + (common.ports.dev + 1),
				path.resolve('./app/index.js')
			],
			output: {
				filename: 'js/index.js'
			}
		};
	}

	return {
		entry: path.resolve('./app/index.js'),
		output: {
			filename: 'js/index.[hash].js'
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin()
		]
	};
}
function getHtmlPlugins() {
	const plugins = [
		getPlugin({ filename: 'index.ejs', isDevServer: false }), // For server-rendering
	];

	if (common.IS_DEV) { // For dev-server and non-server-rendering
		plugins.push( getPlugin({ filename: 'index.html' }) );
	}

	return plugins;

	function getPlugin (options) {
		const htmlOptions = {
			template: 'static/index.ejs',
			inject: false,

			isDevServer: true,
			isDev: common.IS_DEV
		};

		return new HtmlWebpackPlugin({
			...htmlOptions,
			...options
		});
	}
}
