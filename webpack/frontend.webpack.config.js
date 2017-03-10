const path = require('path');
const merge = require('webpack-merge');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./common.webpack.config.js');

const config = {
	output: {

	},

	plugins: [
		new HtmlWebpackPlugin({ // For production
			template: 'static/index.ejs',
			filename: 'index.ejs',
			inject: false,
			
			title: 'React Server Rendering Boilerplate',
			markup: '<%- markup %>',
			data: '<%- JSON.stringify(data || {}) %>',
			source: common.SOURCE
		}),
		new HtmlWebpackPlugin({  // For dev-server
			template: 'static/index.ejs',
			filename: 'index.html',
			inject: false,

			title: 'React Server Rendering Boilerplate',
			source: common.SOURCE
		}),
		new webpack.DefinePlugin({
			__IS_BROWSER__: true
		})
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

module.exports = merge.smart(common.config, config, getEnvConfig());

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
		}
	};
}
