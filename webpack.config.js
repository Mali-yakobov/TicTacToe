var config = {
   entry: './client/game.js',
	
   output: {
      path:'/',
      filename: 'index.js',
   },
	
   devServer: {
     
   },
	
   module: {
      loaders: [
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
				
            query: {
               presets: ['es2015', 'react']
            }
         },
         {
            test: /\.css$/,
            use: [
             { loader: "style-loader" },
             { loader: "css-loader" }]

            }
            
      ]
   }
}

module.exports = config;
