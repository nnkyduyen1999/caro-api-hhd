let onlineUsers = []
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

module.exports = (io, socket) => {
  //join a chat room
  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  //listen for new connection
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
    // Leave the room if the user closes the socket
    socket.leave(roomId);
  })
};
