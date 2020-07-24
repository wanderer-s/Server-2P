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
    userId: 
    username: //..?nickname
    avatar:
    isReady:
  },
  room: {
    gameCode:
    roomId:
    roomName:
    roomOwner:
  }
*/

// Run when client connects
io.on('connection', (socket) => {
  //방 입장시
  socket.on('joinRoom', ({ userInfo, room }) => {
    const user = userJoin(socket.id, userInfo, room);
    socket.join(user.room.roomId);
    socket.emit('message', { username: 'System', text: '대기방에 입장하셨습니다!' });
    socket.broadcast
      .to(user.room.roomId)
      .emit('message', { username: 'System', text: `${user.userInfo.username} has joined the chat` });
    io.to(user.room.roomId).emit('roomUsers', {
      room: user.room.roomId,
      users: getRoomUsers(user.room.roomId)
    });
  });
  // 채팅
  socket.on('message', (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room.roomId).emit('message', { username: user.userInfo.username, text: msg });
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
  // 방 나가기
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room.roomId).emit(
        'message',
        formatMessage(botName, `${user.userInfo.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room.roomId).emit('roomUsers', {
        room: user.room.roomId,
        users: getRoomUsers(user.room.roomId),
      });
    }
  });
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));