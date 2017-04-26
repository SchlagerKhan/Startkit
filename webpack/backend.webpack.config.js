const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const merge = require('webpack-merge');

const common = require('./common.webpack.config.js');

const nodeModules = fs.readdirSync(path.resolve('./node_modules'))
	.concat(['react-dom/server', 'react/addons'])
	.reduce((ext, mod) => {
		ext[mod] = 'commonjs ' + mod;
		return ext;
	}, {});

const config = {
	entry: path.resolve('./server/server'),
	output: {
		filename: '../server.js',
	},

	plugins: [
		new webpack.DefinePlugin({
			__IS_BROWSER__: false
		})
	],

	devtool: 'source-map',

	target: 'node',
	externals: nodeModules,
};

const mergedConfig = merge.smart(common.config, config);

module.exports = mergedConfig;


console.log(path.resolve('app'));
