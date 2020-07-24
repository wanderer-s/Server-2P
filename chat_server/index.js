const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');
/*
  user: {
    username: //..?nickname
    avatar:
    isReady:
  },
  room: {
    gameCode:
    roomId:
  }
*/

// Run when client connects
io.on('connection', (socket) => {
  //방 입장시
  socket.on('joinRoom', ({ userInfo, room }) => {
    const user = userJoin(socket.id, userInfo, room);
    socket.join(user.room.roomId);
    socket.emit('systemMessage', { username: 'System', text: '대기방에 입장하셨습니다!' });
    // socket.emit('loadUser', { username, avatar, isLogin: false });
    io.to(user.room.roomId).emit('loadUser', { username, avatar, isLogin: false });
    socket.broadcast
      .to(user.room.roomId)
      .emit('sendMessage', { username: 'System', text: `${user.username} has joined the chat` });
    io.to(user.room.roomId).emit('roomUsers', {
      room: user.room.roomId,
      users: getRoomUsers(user.room.roomId)
    });
  });
  // 채팅
  socket.on('sendMessage', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room.roomId).emit('sendMessage', { username: user.userInfo.username, text: msg });
  });
  // 준비 버튼
  socket.on('ready', () => {
    //isReady 상태 변경
    const user = getCurrentUser(socket.id);
    user.userInfo.isReady = !user.userInfo.isReady; //반전

    //현재 준비상태 전송
    socket.broadcast
      .to(user.room.roomId)
      .emit('readyState',
        {
          userId: user.userInfo.userId,
          username: user.userInfo.username,
          isReady: user.userInfo.isReady
        });
    const roomUsers = getRoomUsers(user.room.roomId);
    //전부 준비한 상황
    if (roomUsers[0].userInfo.isReady && roomUsers[1].userInfo.isReady) {
      socket.broadcast
        .to(user.room.roomId)
        .emit('message', { username: 'System', text: 'gameStart!' });
    }
  });
  socket.on('leave', () => {
    const user = getCurrentUser(socket.id);
    userLeave(socket.id);
    socket.leave(user.room.roomId);
    socket.broadcast
      .to(user.room.roomId)
      .emit('systemMessage', { username: 'System', text: `${user.userInfo.username} has left the chat` });
  });
  // 방 나가기
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room.roomId).emit('systemMessage', {
        username: 'system',
        text: `${user.userInfo.username} has left the room`,
      });

    }
  });
});


const PORT = process.env.PORT || 3002;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
