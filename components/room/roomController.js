const RoomDAL = require("./roomDAL");
const UserDAL = require("../user/userDAL");
const Room = require("./roomModel");

module.exports = {
  all: async (req, res, next) => {
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
};
