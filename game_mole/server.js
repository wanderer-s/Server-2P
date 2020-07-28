const { createServer } = require('http')
const app = require('express')()
const httpServer = createServer(app)
const io = require('socket.io')(httpServer)

const {gameJoin, getCurrentScores,} = require('./utils')

const PORT = 3009

io.on('connect', (socket) => {
	socket.on('gameStart', (username, gameRoomId) => {
		let game = gameJoin(username, gameRoomId)
		if(game.usernames.length === 2) {
			const moleTimer = setInterval( () => {
				let randomIndex = Math.floor(Math.random() * 16)
				socket.emit('generateMole', randomIndex)
			}, 3000)
			setTimeout(() => {
				clearInterval(moleTimer)
				let scores = getCurrentScores(gameRoomId)
				let player = Object.keys(scores)
				let winner = 
				scores[player[0]] > scores[player[1]]
					? player[0]
					: scores[player[0]] < scores[player[1]]
						? player[1]
						: 'tie'
				socket.emit('gameover', winner)
			},93000)
		}
	})
})

httpServer.listen(PORT, () => {
	console.log(`server on ${PORT}`)
})
