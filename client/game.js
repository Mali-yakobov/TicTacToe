import React from 'react';
import ReactDOM from 'react-dom';
import Board from './board.js';
import AlertContainer from 'react-alert';
import styles from './app.css';
const io = require('socket.io-client');
const socket = io();

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(16).fill(null),
      xIsNext: false,
      xo: '',
      winner: ''
  };
    
    socket.on('connect_player', (player) =>  this.updateCodeFromSockets(player)); 
    socket.on('mark', (index,mark) => this.mark(index, mark));
    socket.on('gameover', (squares) => this.gameover(squares));
    socket.on('restart', () => this.resetAll());
    socket.on('showAlert', (text) => this.showAlert(text));
  }

  updateCodeFromSockets(player) {
      this.setState({xo: player.mark});
  }

  resetAll(){
    const mark = this.state.xo;
    this.setState({
      squares: Array(16).fill(null),
      xIsNext: false,
      xo: mark,
      winner: undefined
    });
  }

 reset() {
  const mark = this.state.xo;
    this.setState({
      squares: Array(16).fill(null),
      xIsNext: false,
      xo: mark,
      winner: undefined
    });
     socket.emit('new_game');
  }

  componentWillMount(){
    socket.emit('client_connected');
  	socket.on('connect_player', (player) =>  this.updateCodeFromSockets(player)); 
  }
  componentDidMount() {
    socket.on('connect_player', (player) =>  this.updateCodeFromSockets(player)); 
  }

  mark(i, mark){
    const squares = this.state.squares.slice();
    squares[i] = mark;
    this.setState({
          xIsNext: !this.state.xIsNext,
          squares: squares
        });
  }

  gameover(squares, winner){
    console.log(winner);
    console.log(squares);
    this.setState({
          squares: squares,
          winner: winner
        });
  }

  handleClick(i) {
    socket.emit("process_move", i, this.state.xo);
  }

  showAlert(text){
    this.msg.show(text, {
      time: 2000,
      type: 'success',
      icon: <img src="./images/xo.png" />
    });
  }
   
  render() {
    const squares = this.state.squares;
    let mark = "Player Mark:   " + this.state.xo;
    let status;
    const winner = this.state.winner;
   
    /*if (winner != '') {
      status = "Winner:   " +  winner;
    } else {*/
      status = "Next player:   " + (this.state.xIsNext ? "X" : "O");
    //}

    return (
      <div className="game">
      <div><h1>Tic Tac Toe</h1></div>
        <div className="game-board">
          <Board
            squares={squares}
            onClick={i => this.handleClick(i)}
          />
          <div className="game-info" >
          <div>{mark}</div>
          <div>{status}</div>
       <button className="resetButton" type="button" onClick={() => this.reset()}>New Game</button>
        <div>
        <AlertContainer ref={a => this.msg = a} {...this.alertOptions} />
      </div>
        </div>
        </div>
        
      </div>
    );
  }

}

ReactDOM.render(<Game />, document.getElementById("root"));

  