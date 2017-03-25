const path = require('path');
const merge = require('webpack-merge');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const common = require('./common.webpack.config.js');
const htmlOptions = {
	template: 'static/index.ejs',
	inject: false,

	title: 'React Server Rendering Boilerplate',
	markup: '',
	insertData: 'false'
};

const config = {
	plugins: [
		new HtmlWebpackPlugin({ // For production
			...htmlOptions,
			filename: 'index.ejs',

			markup: '<%- markup %>',
			insertData: '<%- insertData %>'
		}),
		new HtmlWebpackPlugin({  // For dev-server
			...htmlOptions,
			filename: 'index.html'
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
