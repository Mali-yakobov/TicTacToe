var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.js');
var http = require('http')
var socketio = require('socket.io');
var app = express();
var path = require("path");
var application_root = __dirname;
app.use(express.static(path.join(application_root, "client")));
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {  
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(require('webpack-hot-middleware')(compiler)); 

var server = http.Server(app);
var websocket = socketio(server);
server.listen(8080, () => console.log('listening on localhost:8080'));

var xo = 'O'; 
var x = false;
var m_players = [];
var i = 0, xIsNext = false;
var squares = Array(16).fill(null);
var gameover = false, startGame = false, winner = "";
    

//TODO: assert that there are only two connections 
//TODO: handle case refresh event

websocket.sockets.on('connection', function(socket){
  
  socket.on('client_connected', function(){
    var player = {id:0, mark:'O'};
   
    player.id = socket.id;
    
    if(xo == 'O' && x ) 
    {
      xo = 'X';
      player.mark = xo;
      
    }
    else
      x = true;
    
    m_players[i] = player;
    i++;
   console.log(player);
    socket.emit('connect_player', player);
    if(i == 2)
    	startGame = true;
   
  });
  socket.on('new_game', function(){
  	squares = Array(16).fill(null);
  	xIsNext =  false;
  	if(i < 2)
  		startGame = false;
    websocket.sockets.emit('restart');
  });

  socket.on('process_move', function(index, mark){
	    
	  if(startGame && !gameover){
	    if(squares[index] != null){
	      socket.emit('showAlert', 'Choose other cell!');
	      return;
	    }
	    if(xIsNext && mark == 'O' || !xIsNext && mark == 'X')
	  		socket.emit('showAlert', 'Not your turn!');
	    else{
	      squares[index] = mark;
	      xIsNext = !xIsNext;
	      websocket.sockets.emit('mark', index, mark);
	    }
	    if (calculateWinner(squares, mark) ) {
	    	 winner = mark;
		     
		      websocket.sockets.emit('gameover', squares, winner);
	    	socket.emit('showAlert', 'Game Over');
	      return;
	    }
	  }
	  else if(!startGame && !gameover){
	  	socket.emit('showAlert', 'Waiting to second player connection');
	  }
	  else if(gameover)
	  	socket.emit('showAlert', 'Game Over');

    
    
  });
  
  socket.on('disconnect', function(){
    console.log('user disconnected');
    i--;
    //todo: check which mark left in the game
   });
  
});

function calculateWinner(squares, mark) {
  const lines = [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
    [0, 5, 10, 15],
    [3, 6, 9, 12]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c] && squares[a] === squares[d]) {
      squares[a] = '|';
      squares[b] = '|';
      squares[c] = '|';
      squares[d] = '|';
      gameover = true;
     
     return mark;  
    }
  }
  return null;
}
