/*eslint-disable*/
const { createServer } = require('http');
const express = require('express');
const app = express();
const httpServer = createServer(app);
const io = require('socket.io')(httpServer);

const { gameJoin, getCurrentScores, getCurrentGame, leaveGame } = require('./utils/games');


const PORT = 3009;

io.on('connect', (socket) => {
  socket.on('gameStart', (username, gameRoomId) => {
    let [game, refreshed] = gameJoin(username, gameRoomId, socket.id);
    socket.join(gameRoomId);
    io.to(gameRoomId).emit('init', [game.usernames, game.currentMole, game.score]);
    if (game.usernames.length === 2 && refreshed === false) {
      const moleTimer = setInterval(() => {
        let randomIndex = Math.floor(Math.random() * 16);
        io.to(gameRoomId).emit('generateMole', randomIndex);
        getCurrentGame(gameRoomId).currentMole += 1;
      }, 3000);
      setTimeout(() => {
        clearInterval(moleTimer);
        let scores = getCurrentScores(gameRoomId);
        let player = Object.keys(scores);
        let winner =
          scores[player[0]] > scores[player[1]]
            ? player[0]
            : scores[player[0]] < scores[player[1]]
            ? player[1]
            : 'tie';
        io.to(gameRoomId).emit('gameover', winner);
        let result = {}
        result.score = scores
        result.gameCode = 0
        
        fetch('http://localhost:3001', {
          method: 'post',
          header: {
            'Content-type': 'appliction/json'
          },
          body: result})
        leaveGame(gameRoomId);
      }, 93000);
    }
  });
  socket.on('moleClick', (data) => {
    let { username, index, currentMole, gameRoomId } = data;
    let currentGame = getCurrentGame(gameRoomId);
    const [player1, player2] = Object.keys(currentGame.score);
    if (currentGame.currentMole === currentMole) {
      currentGame.score[username] += 10;
      const result = { score: {} };
      result.score[player1] = currentGame.score[player1];
      result.score[player2] = currentGame.score[player2];
      result.index = index;
      io.to(gameRoomId).emit('updateScore', result);
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
