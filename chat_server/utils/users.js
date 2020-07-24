const users = [];

// Join user to chat
function userJoin(id, userInfo, room) {
  const user = { id, userInfo, room };
  user.userInfo.isReady = 0;

  users.push(user);
  return user;
}

// Get current user
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  const user = getCurrentUser(id);
  //방장이 나간경우 방폭
  fetch('http://localhost:3001/rooms/leaveroom', {
    method: 'POST',
    body: JSON.parse({
      roomId: user.room.roomId,
      username: user.userInfo.username,
      gameCode: user.room.gameCode
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then()
    .catch(err => console.log(err));

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Get room users
function getRoomUsers(roomId) {
  return users.filter(user => user.room.roomId === roomId);
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
