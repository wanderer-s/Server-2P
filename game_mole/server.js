const { createServer } = require('http')
const app = require('express')()
const httpServer = createServer(app)
const io = require('socket.io')(httpServer)

const PORT = 3009

app.get('/', (req, res) => {
	res.status(200).send('<h1>welcome<h1/>')
})

io.on('connect', (socket) => {
	console.log('new connection')
	socket.emit('message', 'welcome')
})

httpServer.listen(PORT, () => {
	console.log(`server on ${PORT}`)
})
