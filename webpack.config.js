const { resolve, join } = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");

const notFalse = (val) => val !== false;
const nodeEnv = process.env.NODE_ENV.toLowerCase();
const IS_PROD = nodeEnv === "production";
const IS_DEV = nodeEnv === "development";

if (!IS_PROD && !IS_DEV) {
  throw new Error("NODE_ENV was not set production or development (it was '" + nodeEnv + "')");
}

const outputDir = resolve(__dirname, "build", "client");
const entryPoints = resolve(__dirname, "src", "client", "index.tsx");

const babelLoader = {
  loader: "babel-loader",
  options: {
    cacheDirectory: true,
    plugins: ["@babel/plugin-syntax-dynamic-import", "date-fns"].filter(notFalse),
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
    configFile: "tsconfig.json",
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
      toplevel: true,
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
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [babelLoader, tsLoader],
        exclude: /node_modules/,
      },
      {
        test: /\.js(x?)$/,
        use: [babelLoader],
        exclude: /node_modules/,
      },
      {
        test: /\.html$/,
        loader: "html-loader",
      },
      {
        test: /\.(s?)css$/,
        include: /node_modules/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(s?)css$/,
        exclude: /node_modules/,
        use: [IS_PROD ? MiniCssExtractPlugin.loader : "style-loader", typedCssLoader, "sass-loader"],
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
    new HtmlWebpackPlugin({
      template: resolve(__dirname, "src", "client", "index.html"),
      inject: true,
      hash: IS_DEV,
      minify: IS_PROD,
      alwaysWriteToDisk: IS_DEV,
    }),
    IS_PROD &&
      new MiniCssExtractPlugin({
        minimize: true,
        filename: "[name].css",
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
    splitChunks: {
      chunks: "all",
      maxInitialRequests: Infinity,
      minSize: 0,
      cacheGroups: {
        // bundle dependencies and global styles separately so they can be cached for longer
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: (module) =>
            "npm~" +
            module
              .identifier()
              .match(/\/node_modules\/((@.*?\/.*?)|(.*?))[/]/)[1]
              .replace("/", "~")
              .replace("@", ""),
        },
        globalStyles: {
          test: /[\\/]global-styles[\\/]/,
          name: (m) => {
            const resource = m.resource || m.issuer.resource;
            return "style~" + resource.match(/\/global-styles\/(.*?)\.(s?)css/)[1].toLowerCase();
          },
        },
      },
    },
  },
  performance: {
    hints: IS_PROD ? "warning" : false,
  },
  stats: "minimal",
};

module.exports = config;
