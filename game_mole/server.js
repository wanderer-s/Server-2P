const { createServer } = require('http');
const express = require('express');
const app = express();
const httpServer = createServer(app);
const io = require('socket.io')(httpServer);

const {gameJoin, getCurrentScores, getCurrentGame, leaveGame} = require('./utils/games');

const PORT = 3009;

io.on('connect', (socket) => {
	socket.on('gameStart', (username, gameRoomId) => {
		let game = gameJoin(username, gameRoomId);
		socket.join(gameRoomId);
		if(game.usernames.length === 2) {
			const moleTimer = setInterval( () => {
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
				socket.emit('gameover', winner);
				let result = {};
				result.score = scores;
				result.gameCode = 0;

				fetch('http://localhost:3001',{
					method: 'post',
					headers: {
						'Content-Type': 'application/json'
					},
					body: result});
				leaveGame(gameRoomId);
			},93000);
		}
	});
	socket.on('moleClick', data => {
		let {username, index, currentMole, gameRoomId} = data;
		let currentGame = getCurrentGame(gameRoomId);
		if(currentGame.currentMole === currentMole) {
			currentGame.score[username] += 10;
			const result = {};
			result[username] = currentGame.score;
			result.index = index;
			io.to(gameRoomId).emit('updateScore', result);
		}
	});
});

httpServer.listen(PORT, () => {
	console.log(`server on ${PORT}`);
});
