/*eslint-disable*/
const { createServer } = require('http');
const express = require('express');
const app = express();
const httpServer = createServer(app);
const io = require('socket.io')(httpServer);
const fetch = require('node-fetch');

const { web_server_url } = require('../url');

const { gameJoin, getCurrentScores, getCurrentGame, leaveGame } = require('./utils/games');

const PORT = 3009;

io.on('connect', (socket) => {
  //client의 socket에서 gameStart로 event발생시 server에서 반응
  socket.on('gameStart', (username, gameRoomId, avatarId) => {
    let [game, refreshed] = gameJoin(username, gameRoomId, socket.id, avatarId);
    socket.join(gameRoomId);
    //'init'으로 event 발생 user가 2명이고 refreshed가 false이면 게임시작
    io.to(gameRoomId).emit('init', [game.usernames, game.currentMole, game.score, game.avatarId]);
    if (game.usernames.length === 2 && refreshed === false) {
      //3초마다 generateMole event 발생하며 
      //0~16사이 랜덤한 숫자를 보냄(두더지의 위치) 
      //현재 두더지가 몇번째 두더지인지 파악하기 위해 currentMole += 1
      const moleTimer = setInterval(() => {
        let randomIndex = Math.floor(Math.random() * 16);
        io.to(gameRoomId).emit('generateMole', randomIndex);
        getCurrentGame(gameRoomId).currentMole += 1;
      }, 3000);
      setTimeout(() => { 
        //1분 30초 뒤 반복작업 종료 즉 게임종료
        clearInterval(moleTimer);
        let scores = getCurrentScores(gameRoomId);
        let player = Object.keys(scores);
        let winner =
          scores[player[0]] > scores[player[1]]
            ? player[0]
            : scores[player[0]] < scores[player[1]]
            ? player[1]
            : 'tie';
        //gameover 이벤트 발생후 winner에 player전송
        //게임결과는 게임코드와 player별 점수를 담아
        //web 서버로 전송 (web 서버에서 db 작업 수행) 
        io.to(gameRoomId).emit('gameover', winner);
        let result = {};
        result.score = scores;
        result.gameCode = 1;

        fetch(`${web_server_url}/users/mypage`, {
          method: 'post',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify(result),
        });
        leaveGame(gameRoomId);
      }, 93000);
    }
  });
  //client에서 moleclick 이벤트 발생시
  //client와 server의 currentMole 비교 후 같으면(맞는 자리에 두더지를 클릭하면) score + 10
  //score 결과를 client로 전송 (client의 점수판 업데이트를 위해)
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

  //client에서 activateGif 이벤트 발생시
  //socket에 속한 gameRoomId가 같은 사용자에게 gif 전송(이모티콘기능)
  socket.on('activateGif', (data) => {
    const { gameRoomId, gif } = data;
    socket.broadcast.to(gameRoomId).emit('opponentGif', gif);
  });
});

httpServer.listen(PORT, () => {
  console.log(`server on ${PORT}`);
});
