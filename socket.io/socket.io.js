const roomDAL = require("../components/room/roomDAL");
const userDAL = require("../components/user/userDAL");
const { TROPHY_RANGE } = require("../global/constant");
const {
  UPDATE_ONLINE_USERS,
  GIVEN_IN_EVENT,
  NEW_CHAT_MESSAGE_EVENT,
  MATCHING,
  SUCCESSFULLY_MATCHED,
  JOIN_ROOM,
  REQUEST_MOVE,
  ACCEPT_MOVE,
  DISCONNECT,
  CREATE_ROOM,
  NEW_ROOM_CREATED,
  IN_WAITING,
  NEW_CONNECT,
  BECOME_PLAYER,
  UPDATE_CURRENT_PLAYER
} = require("./socket-event");

let onlineUsers = [];
let matchingUsers = [];

let createdRooms = [];
// let listRoom = [];

module.exports = (io, socket) => {
  //listen for new connection
  socket.on(NEW_CONNECT, async (userId) => {
    if (!onlineUsers.some((item) => item.userId === userId)) {
      onlineUsers.push({
        userId: userId,
        socketId: socket.id,
      });
      await userDAL.updateOnlineStatus(userId, true);
      io.emit(UPDATE_ONLINE_USERS);
    }
  });

  socket.on(MATCHING, async (user) => {
    if (matchingUsers.length >= 1) {
      //there are users matching before

      // check user already have matching or not
      const userIndex = matchingUsers.findIndex(
        (item) => item._id === user._id
      );

      if (userIndex !== -1) {
        matchingUsers[userIndex].socketId = socket.id;
      } else {
        //find matching users with same trophy range
        const matchIndex = matchingUsers.findIndex((item) => {
          return (
            item.trophy - TROPHY_RANGE <= user.trophy &&
            user.trophy <= item.trophy + TROPHY_RANGE
          );
        });

        if (matchIndex !== -1) {
          //create room
          const createdRoom = await roomDAL.insert(
            matchingUsers[matchIndex]._id,
            user._id
          );

          const newRoom = {
            ...createdRoom._doc,
            xPlayer: matchingUsers[matchIndex],
            oPlayer: { ...user, socketId: socket.id}
          }
          // listRoom.push(newRoom)

          socket.broadcast
            .to(matchingUsers[matchIndex].socketId)
            .emit(SUCCESSFULLY_MATCHED, createdRoom._id);
          socket.emit(SUCCESSFULLY_MATCHED, createdRoom._id);

          io.emit(NEW_ROOM_CREATED);

          matchingUsers.splice(matchIndex, 1);
        } else {
          matchingUsers.push({
            ...user,
            socketId: socket.id,
          });
        }
      }
    } else {
      //there is no user matching yet
      matchingUsers.push({
        ...user,
        socketId: socket.id,
      });
    }
  });

  socket.on(BECOME_PLAYER, async (data) => {
    if (data.player === 'X') {
      await roomDAL.updateXCurrentPlayer(data.roomId, data.user._id)
    } else if (data.player === 'O') {
      await roomDAL.updateOCurrentPlayer(data.roomId, data.user._id)
    }
    io.emit(UPDATE_CURRENT_PLAYER, data)
  })

  //listening for creating room
  socket.on(CREATE_ROOM, async (data) => {
    const roomToDB = await roomDAL.addToDB(data);
    createdRooms.push(roomToDB);
    //io.sockets.emit("newRoomCreated", createdRooms);
    io.emit(NEW_ROOM_CREATED);
    socket.emit(IN_WAITING, roomToDB);
  });

  //Join a room
  socket.on(JOIN_ROOM, (roomId) => {
    socket.join(roomId);
  });

  socket.on(REQUEST_MOVE, (data) => {
    // console.log("req", data, data.roomId);
    io.to(data.roomId).emit(ACCEPT_MOVE, data);
  });

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(data.roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  socket.on(GIVEN_IN_EVENT, (data) => {
    console.log("req", data);
    io.in(data.roomId).emit(GIVEN_IN_EVENT, data);
  });

  socket.on(DISCONNECT, async () => {
    const user = onlineUsers.find((item) => item.socketId === socket.id);
    if (user) {
      await userDAL.updateOnlineStatus(user.userId, false);
    }

    const temp = onlineUsers.filter((item) => item.socketId !== socket.id);
    onlineUsers = [...temp];
    io.emit(UPDATE_ONLINE_USERS);

    // Leave the room if the user closes the socket
    // socket.leave(roomId);
  });
};
