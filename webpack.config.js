/* eslint-env node */
module.exports = {
  // ... other webpack config options
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      // Add your custom middleware here if needed
      
      return middlewares;
    },
    // ... other devServer options
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
}; 