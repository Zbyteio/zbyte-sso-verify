const path = require('path');

module.exports = {
	entry: './src/index.ts',
	mode: 'development',
	target: 'web',
	devtool: 'source-map',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
		libraryTarget : "umd",
		globalObject: 'this'
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.test\.ts$/,
				use: 'null-loader',
			},
		],
	},
    resolve: {
        symlinks: false,
        fallback: {
            "ramda": false,
            "buffer": false,
            "util": false,
            "stream": false,
            "crypto": false
        },
		plugins: [
			new webpack.ProvidePlugin({
				 Buffer: ['buffer', 'Buffer'],
				 process: 'process/browser',
			}),
		], 
    }
};