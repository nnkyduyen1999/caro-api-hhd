const RoomDAL = require("./roomDAL");
const UserDAL = require("../user/userDAL");
const Room = require("./roomModel");
const roomDAL = require("./roomDAL");
const gameDAL = require("../game/gameDAL");

module.exports = {
  allWithPlayerUsername: async (req, res, next) => {
    try {
      const rooms = await RoomDAL.all();
      const roomsWithUsername = [];
      for (let item of rooms) {
        const xPlayer = item.xCurrentPlayer
          ? await UserDAL.loadUsernameById(item.xCurrentPlayer)
          : "";
        const oPlayer = item.oCurrentPlayer
          ? await UserDAL.loadUsernameById(item.oCurrentPlayer)
          : "";
        roomsWithUsername.push({
          ...item._doc,
          xPlayerUsername: xPlayer ? xPlayer.username : "",
          oPlayerUsername: oPlayer ? oPlayer.username : "",
        });
      }

      res.send(roomsWithUsername);
    } catch (err) {
      res.send(err);
    }
  },

  loadRoomWithPlayerInfoById: async (req, res, next) => {
    const roomId = req.params.id;

    try {
      const room = await roomDAL.getRoomById(roomId);

      if (room) {
        const xPlayer = room.xCurrentPlayer
          ? await UserDAL.loadUsernameById(room.xCurrentPlayer)
          : "";
        const oPlayer = room.oCurrentPlayer
          ? await UserDAL.loadUsernameById(room.oCurrentPlayer)
          : "";

        return res.status(200).send({
          ...room._doc,
          xPlayerUsername: xPlayer ? xPlayer.username : "",
          oPlayerUsername: oPlayer ? oPlayer.username : "",
        });
      }
      return res.status(400).json({ message: "room not found" });
    } catch (err) {
      res.status(500).send(err);
    }
  },

  getById: async (req, res, next) => {
    const roomId = req.params.id;

    try {
      const room = await Room.findById(roomId);
      if (room) {
        return res.status(200).json({ room });
      }
      return res.status(400).json({ message: "room not found" });
    } catch (err) {
      res.status(500).send(err);
    }
  },

  getLatestGameInRoomById: async (req, res, next) => {
    const roomId = req.params.id;
    try {
      const game = await gameDAL.getLatestGameInRoomById(roomId);
      if (game) {
        const gameInfo = {
          game: { ...game._doc },
          stepNumber: game.history.length - 1,
          xIsNext: game.history.length - (1 % 2) === 0,
          latestLocation: game.history[game.history.length - 1].location,
        };
        return res.status(200).send(gameInfo);
      }
      return res.status(400).json({ message: "room not found" });
    } catch (err) {
      res.status(500).send(err);
    }
  },
};
