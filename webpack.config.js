const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const glob = require("glob");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const md5 = require("md5");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ReplaceInFileWebpackPlugin = require("replace-in-file-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const {resolve, join} = require("path");

const notFalse = (val) => val !== false;
const nodeEnv = process.env.NODE_ENV.toLowerCase();
const IS_TEST = nodeEnv === "test";
const IS_PROD = nodeEnv === "production";
const IS_DEV = nodeEnv === "development";

if (!IS_TEST && !IS_PROD && !IS_DEV) {
	throw new Error("NODE_ENV was not set to one of test, production or development (it was '" + nodeEnv + "'");
}

const outputDir = resolve(__dirname, "build", "client");
const entryPoints = IS_TEST
		? glob.sync("./src/client/**/*.tests.{ts,tsx}")
		: resolve(__dirname, "src", "client", "index.tsx");

const babelLoader = {
	loader: "babel-loader",
	options: {
		cacheDirectory: true,
		plugins: [
			IS_TEST && "istanbul",
			"@babel/plugin-syntax-dynamic-import",
		].filter(notFalse),
		presets: [
			[
				"@babel/preset-env",
				{
					targets: {
						esmodules: true,
					},
					modules: false,
				},
			],
			["@babel/typescript"],
			["@babel/react"],
		],
	},
};

const tsLoader = {
	loader: "ts-loader",
	options: {
		transpileOnly: true,
		configFile: IS_TEST ? "tsconfig.client-test.json" : "tsconfig.client.json",
		compilerOptions: {
			module: "esnext",
		},
	},
};

const typedCssLoader = {
	loader: "typings-for-css-modules-loader",
	options: {
		camelCase: "only",
		modules: true,
		namedExport: true,
		sourceMap: IS_DEV,
		localIdentName: IS_PROD ? "[hash:base64:5]" : "[name]_[local]_[hash:base64:5]",
	},
};

const terserMinimiser = new TerserWebpackPlugin({
	parallel: true,
	terserOptions: {
		cache: true,
		ecma: 6,
		toplevel: true,
		module: true,
		sourceMap: false,
		compress: {
			drop_console: true,
		},
		mangle: {
			properties: {
				regex: /^[A-Z]+_[A-Z_]+$/, // should only match redux actions and cache keys
			},
		},
	},
});

const config = {
	mode: IS_PROD ? "production" : "development",
	cache: false,
	target: "web",
	entry: entryPoints,
	output: {
		publicPath: "/",
		path: outputDir,
		filename: "[name].js",

		// used in development mode only
		hotUpdateMainFilename: "hot-update.[hash:6].json",
		hotUpdateChunkFilename: "hot-update.[hash:6].js",
	},
	node: {
		fs: "empty",
		__filename: true,
		__dirname: true,
	},
	module: {
		// in test mode, disable this warning
		exprContextCritical: !IS_TEST,

		rules: [
			{
				test: /\.ts(x?)$/,
				use: [
					babelLoader,
					tsLoader,
				],
				exclude: /node_modules/,
			},
			{
				test: /\.js(x?)$/,
				use: [
					babelLoader,
				],
				exclude: /node_modules/,
			},
			{
				test: /\.html$/,
				loader: "html-loader",
			},
			{
				test: /\.(s?)css$/,
				include: /node_modules/,
				use: [
					"style-loader",
					"css-loader",
					"sass-loader",
				],
			},
			{
				test: /\.(s?)css$/,
				exclude: /node_modules/,
				use: [
					IS_PROD ? MiniCssExtractPlugin.loader : "style-loader",
					typedCssLoader,
					"sass-loader",
				],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/,
				loader: "file-loader",
			},
		],
	},
	devtool: IS_PROD ? false : "cheap-module-eval-source-map",
	plugins: [
		new webpack.WatchIgnorePlugin([/css\.d\.ts$/]),
		new webpack.EnvironmentPlugin(["NODE_ENV"]),
		new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
		!IS_TEST && new HtmlWebpackPlugin({
			template: resolve(__dirname, "src", "client", "index.html"),
			inject: true,
			hash: IS_DEV,
			minify: IS_PROD,
			alwaysWriteToDisk: IS_DEV,
		}),
		IS_PROD && new ReplaceInFileWebpackPlugin([
			{
				test: /\.[jt]s(x?)$/,
				dir: outputDir,
				rules: [
					{
						// replace redux action strings with hashes
						search: /"([A-Za-z]+)Actions\.([_A-Z]+)"/g,
						replace: (str) => "\"" + md5(str).substring(0, 6) + "\"",
					},
					{
						// replace redux cache keys with hashes
						search: /"([A-Za-z]+)CacheKeys\.([_A-Z]+)"/g,
						replace: (str) => "\"" + md5(str).substring(0, 6) + "\"",
					},
				],
			},
			{
				test: /\.(s?)css$/,
				dir: outputDir,
				rules: [
					{
						// trim a couple of bytes from the (S)CSS output
						search: /\n/g,
						replace: "",
					},
				],
			},
		]),
		IS_PROD && new MiniCssExtractPlugin({
			minimize: true,
			filename: "[name].css",
		}),
		IS_PROD && new BundleAnalyzerPlugin({
			analyzerMode: "static",
			openAnalyzer: false,
		}),
		IS_DEV && new webpack.HotModuleReplacementPlugin(),
	].filter(notFalse),
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx"],
		modules: ["node_modules", join("src", "client")],
		alias: {
			// this shim turns all typeorm decorators into no-ops
			typeorm: resolve(__dirname, "node_modules/typeorm/typeorm-model-shim"),
		},
	},
	optimization: {
		minimize: IS_PROD,
		minimizer: IS_PROD ? [terserMinimiser] : [],
		namedModules: IS_DEV,
		splitChunks: !IS_TEST && {
			chunks: "all",
			maxInitialRequests: Infinity,
			minSize: 0,
			cacheGroups: {
				// bundle dependencies and global styles separately so they can be cached for longer
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: (m) => "npm." + m.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1].replace("@", ""),
				},
				globalStyles: {
					test: /[\\/]global-styles[\\/]/,
					name: (m) => {
						const res = m.resource || m.issuer.resource;
						return "styles." + res.match(/[\\/]global-styles[\\/](.*?)\.(s?)css/)[1].toLowerCase();
					},
				},
			},
		},
	},
	performance: {
		hints: IS_PROD ? "warning" : false,
	},
	stats: IS_TEST ? "errors-only" : "minimal",
};

if (IS_DEV || IS_PROD) {
	module.exports = new SpeedMeasurePlugin().wrap(config);
} else {
	module.exports = config;
}
