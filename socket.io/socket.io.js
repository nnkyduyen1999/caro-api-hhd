const gameDAL = require("../components/game/gameDAL");
const roomDAL = require("../components/room/roomDAL");
const userDAL = require("../components/user/userDAL");
const {
  TROPHY_RANGE,
  BONUS_TROPHY,
  DECREASE_TROPHY,
} = require("../global/constant");
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
  UPDATE_CURRENT_PLAYER,
  UPDATE_READY_STATUS,
  START_GAME,
  SAVE_RESULT,
  SAVE_USER_SUCCESS,
  EXIT_ROOM,
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
    const userWithTrophy = await userDAL.loadTrophyById(user._id);
    console.log(userWithTrophy);

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
            item.trophy - TROPHY_RANGE <= userWithTrophy.trophy &&
            userWithTrophy.trophy <= item.trophy + TROPHY_RANGE
          );
        });

        if (matchIndex !== -1) {
          //create room
          const createdRoom = await roomDAL.insert(
            matchingUsers[matchIndex]._id,
            user._id
          );

          socket.broadcast
            .to(matchingUsers[matchIndex].socketId)
            .emit(SUCCESSFULLY_MATCHED, createdRoom._id);
          socket.emit(SUCCESSFULLY_MATCHED, createdRoom._id);

          io.emit(NEW_ROOM_CREATED);

          matchingUsers.splice(matchIndex, 1);
        } else {
          matchingUsers.push({
            ...user,
            trophy: userWithTrophy.trophy,
            socketId: socket.id,
          });
        }
      }
    } else {
      //there is no user matching yet
      matchingUsers.push({
        ...user,
        trophy: userWithTrophy.trophy,
        socketId: socket.id,
      });
    }
  });

  socket.on(BECOME_PLAYER, async (data) => {
    const userTrophy = await userDAL.loadTrophyById(data.user._id);
    let newRoomInfo = { ...data.roomInfo };
    if (data.player === "X") {
      await roomDAL.updateXCurrentPlayer(data.roomId, data.user._id);
      newRoomInfo.xCurrentPlayer = data.user._id;
      newRoomInfo.xPlayerUsername = data.user.username;
      newRoomInfo.xPlayerTrophy = userTrophy.trophy;
      newRoomInfo.xPlayerReady = false;
    } else if (data.player === "O") {
      await roomDAL.updateOCurrentPlayer(data.roomId, data.user._id);
      newRoomInfo.oCurrentPlayer = data.user._id;
      newRoomInfo.oPlayerUsername = data.user.username;
      newRoomInfo.oPlayerTrophy = userTrophy.trophy;
      newRoomInfo.oPlayerReady = false;
    }

    io.emit(UPDATE_CURRENT_PLAYER, {
      ...data,
      roomInfo: newRoomInfo,
    });
  });

  socket.on(UPDATE_READY_STATUS, async (data) => {
    console.log("update-ready data", data);
    if (data.xPlayerReady && data.oPlayerReady) {
      await roomDAL.updateRoomStartGame(data._id);
      const game = await gameDAL.insert(
        data._id,
        data.xCurrentPlayer,
        data.oCurrentPlayer
      );
      console.log("newgame", game);
      let newRoomInfo = { ...data };
      delete newRoomInfo.player;
      newRoomInfo.isPlaying = true;
      newRoomInfo.xPlayerReady = false;
      newRoomInfo.oPlayerReady = false;
      io.emit(START_GAME, { roomInfo: newRoomInfo, game });
    } else {
      if (data.player === "X") {
        await roomDAL.updateXPlayerReady(data._id, data.xPlayerReady);
      } else if (data.player === "O") {
        await roomDAL.updateOPlayerReady(data._id, data.oPlayerReady);
      }
      io.to(data._id).emit(UPDATE_READY_STATUS, data);
    }
  });

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

  socket.on(REQUEST_MOVE, async (data) => {
    await gameDAL.updateGameHistory(data.gameId, data.newHistory);
    io.to(data.roomId).emit(ACCEPT_MOVE, data);
  });

  //save result
  socket.on(SAVE_RESULT, async (data) => {
    const savedGame = await gameDAL.updateGameResult(data);
    // console.log(savedGame);

    const { roomId } = data;
    const savedRoom = await roomDAL.updateRoomResult(roomId);

    const { winner, xPlayer, oPlayer } = data;
    let updatedWinner = null;
    let updatedLoser = null;
    if (winner === `X`) {
      updatedWinner = await userDAL.updateWinnerById(xPlayer, BONUS_TROPHY);
      updatedLoser = await userDAL.updateLoserById(oPlayer, DECREASE_TROPHY);
    } else if (winner === `O`) {
      updatedWinner = await userDAL.updateWinnerById(oPlayer, BONUS_TROPHY);
      updateLoser = await userDAL.updateLoserById(xPlayer, DECREASE_TROPHY);
    } else if (winner === "draw") {
      await userDAL.updateDrawById(xPlayer);
      await userDAL.updateDrawById(oPlayer);
    }

    // console.log("result", updatedWinner, updatedLoser);
    io.emit(SAVE_USER_SUCCESS, {
      updatedWinner: updatedWinner.trophy,
      updatedLoser: updatedLoser.trophy,
      winner: winner,
      roomId: roomId,
    });
  });

  // Listen for new messages
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(data.roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  socket.on(GIVEN_IN_EVENT, async (data) => {
    // console.log("req", data);
    io.in(data.game.roomId).emit(GIVEN_IN_EVENT, data);
    const savedGame = await gameDAL.updateGameResult(data);

    const { roomId } = data.game.roomId;
    const savedRoom = await roomDAL.updateRoomResult(roomId);

    const { xPlayer, oPlayer } = data.game;
    let updatedWinner = null;
    let updatedLoser = null;
    if (data.winner === `X`) {
      updatedWinner = await userDAL.updateWinnerById(xPlayer, BONUS_TROPHY);
      updatedLoser = await userDAL.updateLoserById(oPlayer, DECREASE_TROPHY);
    } else if (data.winner === `O`) {
      updatedWinner = await userDAL.updateWinnerById(oPlayer, BONUS_TROPHY);
      updatedLoser = await userDAL.updateLoserById(xPlayer, DECREASE_TROPHY);
    }

    // console.log("result", updatedWinner, updatedLoser);
    io.emit(SAVE_USER_SUCCESS, {
      updatedWinner: updatedWinner.trophy,
      updatedLoser: updatedLoser.trophy,
      winner: data.winner,
      roomId: roomId,
    });
  });

  socket.on(EXIT_ROOM, async (data) => {
    let newRoomInfo = { ...data.roomInfo };
    if (data.player) {
      if (data.player === "X") {
        await roomDAL.updateXCurrentPlayer(data.roomId, null);
        newRoomInfo.xCurrentPlayer = null;
        newRoomInfo.xPlayerUsername = null;
        newRoomInfo.xPlayerTrophy = 0;
        newRoomInfo.xPlayerReady = false;
      } else if (data.player === "O") {
        await roomDAL.updateOCurrentPlayer(data.roomId, null);
        newRoomInfo.oCurrentPlayer = null;
        newRoomInfo.oPlayerUsername = null;
        newRoomInfo.oPlayerTrophy = 0;
        newRoomInfo.oPlayerReady = false;
      }

      io.emit(UPDATE_CURRENT_PLAYER, {
        ...data,
        roomInfo: newRoomInfo,
      });
    }
    socket.leave(data.roomId);
  });

  socket.on(DISCONNECT, async () => {
    const user = onlineUsers.find((item) => item.socketId === socket.id);
    if (user) {
      await userDAL.updateOnlineStatus(user.userId, false);
      console.log("disconnect ", user);
    }

    const temp = onlineUsers.filter((item) => item.socketId !== socket.id);
    onlineUsers = [...temp];

    const tempMatching = matchingUsers.filter(
      (item) => item.socketId !== socket.id
    );
    matchingUsers = [...tempMatching];
    io.emit(UPDATE_ONLINE_USERS);
  });
};
