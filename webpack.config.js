const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const paths = {
  src: path.resolve(__dirname, 'src'),
};

module.exports = (env) => {
  let keycloakPath = './keycloak.json';
  const dotenvconfig = { path: './.env' };
  if (process.env.IS_RELEASE) {
    console.log('IS_RELEASE');
    dotenvconfig.path = './.env.staging';
    keycloakPath = './keycloak.staging.json';
  } else if (process.env.IS_LIVE) {
    console.log('IS_LIVE');
    dotenvconfig.path = './.env.live';
    keycloakPath = './keycloak.live.json';
  } else if (env) {
    if (env.IS_RELEASE) {
      console.log('IS_RELEASE');
      dotenvconfig.path = './.env.staging';
      keycloakPath = './keycloak.staging.json';
    }
    if (env.IS_LIVE) {
      console.log('IS_LIVE');
      dotenvconfig.path = './.env.live';
      keycloakPath = './keycloak.live.json';
    }
  }
  return {
    mode: 'development',
    entry: ['babel-polyfill', './src/index.js'],
    output: {
      path: path.resolve(__dirname, 'www'),
      filename: 'index.bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|svg|woff2?|ttf|eot)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'images/[hash]-[name].[ext]',
              },
            },
          ],
        },

      ],
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      alias: { '~': paths.src },
      modules: [paths.src, 'node_modules'],
    },
    devtool: 'inline-source-map',
    devServer: {
      port: 9091,
    },
    plugins: [
      new Dotenv(dotenvconfig),
      new CopyWebpackPlugin(
        {
          patterns: [
            {
              from: path.resolve(__dirname, keycloakPath),
              to: path.resolve(__dirname, 'www'),
            },
          ],
        },
      ),
    ],
  };
};
