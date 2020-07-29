const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { userJoin, userLeave, getRoomUsers } = require('./utils/users');

// // Run when client connects
// io.on('connection', (socket) => {
//   //방 입장시
//   socket.on('joinRoom', ({ username, room }) => {
//     const user = userJoin(socket.id, username, room);
//     const roomUsers = getRoomUsers(user.room.roomId);

//     socket.join(user.room);

//     io.to(user.room).emit('loadUsers', roomUsers);
//   });
  
//   // mouse move
//   socket.on('mouseMove', (username, x) => {
//     //내화면
//     socket.emit('myMove', x);
//     socket.broadcast.to().emit('rivalMove',x);
//   });

//   // 방 나가기
//   socket.on('disconnect', () => {
//     const user = userLeave(socket.id);

//     if (user) {
//       const roomUsers = getRoomUsers(user.room.roomId);
//       io.to(user.room.roomId).emit('loadUsers', roomUsers);
//     }
//   });
// });

// Run when client connects
io.on('connection', (socket) => {
  //방 입장시
  socket.on('joinRoom', () => {
    console.log('join');
    //2명일 때 공 시작
  });
  
  // mouse move
  socket.on('mouseMove', (x) => {
    //내화면
    // console.log(x);
    socket.emit('myMove', x);
    socket.broadcast.emit('rivalMove',x);
  });

  //점수 난 경우
  socket.on('start', (x) => {
    socket.emit('start', x);
    socket.broadcast.emit('start',!x);
  })
  // 방 나가기
  socket.on('disconnect', () => {

  });
});
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
