var onlineUsers = [] 

module.exports = (io, socket) => {

  socket.on('new-connection', (user) => {
    if (!onlineUsers.some(item => item._id === user._id)) {
      onlineUsers.push(user)
      io.emit('update-online-users', onlineUsers)
    }
  })

  socket.on('disconnect', (user) => {
    if (!onlineUsers.some(item => item._id === user._id)) {
      const temp = onlineUsers.filter(item => item._id !== user._id)
      onlineUsers = [...temp]
      io.emit('update-online-users', onlineUsers)
    }
  })

};
