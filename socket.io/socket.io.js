const { Socket } = require("socket.io");

var onlineUsers = [] 

module.exports = (io, socket) => {

  socket.on('new-connection', (user) => {
    if (!onlineUsers.includes(user)) {
      onlineUsers.push(user)
      io.emit('new-user', onlineUsers)
    }
  })

  socket.on('disconnect', (user) => {
    if (!onlineUsers.includes(user)) {
      onlineUsers = onlineUsers.filter(item => item !== user)
      io.emit('new-user', onlineUsers)
    }
  })

};
