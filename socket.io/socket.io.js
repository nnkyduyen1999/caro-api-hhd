const roomDAL = require("../components/room/roomDAL");

let onlineUsers = [];
let matchingUsers = [];
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
  socket.on("new-connection", (user) => {
    if (!onlineUsers.some((item) => item.userId === user._id)) {
      onlineUsers.push({
        userId: user._id,
        socketId: socket.id,
        username: user.username,
      });
      io.emit("update-online-users", onlineUsers);
    }
  });

  socket.on("matching", async (user) => {

    if (matchingUsers.length >= 1) {
      //create room
      const createdRoom = await roomDAL.insert(matchingUsers[0].userId, user._id);
      // const roomId = createdRoom._id;
      
      //send message to users
      socket.broadcast
        .to(matchingUsers[0].socketId)
        .emit("successfullyMatched", createdRoom);
      socket.emit("successfullyMatched", createdRoom);
      matchingUsers.shift();

    } else {
      if (!matchingUsers.some((item) => item._id === user._id)) {
        matchingUsers.push({
          userId: user._id,
          socketId: socket.id,
          username: user.username,
        });
      }
    }
  });

  socket.on('joinRoom', roomId => {
    socket.join(roomId)
  })

  socket.on('requestMove', data => {
    console.log('req', data, data.roomId)
    io.to(data.roomId).emit('acceptedMove', data)
  })

  socket.on("disconnect", (user) => {
    if (onlineUsers.some((item) => item._id === user._id)) {
      const temp = onlineUsers.filter((item) => item._id !== user._id);
      onlineUsers = [...temp];
      io.emit("update-online-users", onlineUsers);
    }
    // Leave the room if the user closes the socket
    socket.leave(roomId);
  });
};


