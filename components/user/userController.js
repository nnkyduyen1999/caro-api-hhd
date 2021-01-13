const UserDAL = require("./userDAL");
const GameDAL = require("../game/gameDAL");

module.exports = {
  getOnlineUsers: async (req, res, next) => {
    try {
      const onlineUsers = await UserDAL.getOnlineUsers();
      res.send(onlineUsers);
    } catch (err) {
      res.send(err)
    }
  },
  getTopPlayers: async (req, res, next) => {
    try {
      const topPlayers = await UserDAL.getTopPlayersDAL();
      res.status(200).send(topPlayers);
    } catch (err) {
      res.status(404).send({ message: "Error happening ..."})
    }
  },
  getFinishedGamesById: async (req, res, next) => {
    try {
      const listGameFromDB = await GameDAL.getFinishedGamesByUserIdDAL(req.params.id);
      if (listGameFromDB) {
        res.status(200).send(listGameFromDB);
      }
    } catch (err) {
      res.status(404).send({ message: "Error happening ..."})
    }
  },
  getUserById: async (req, res, next) => {
    try {
      const user = await UserDAL.getUserByIdDAL(req.params.id);
      if (user) {
        res.status(200).send(user);
      }
    } catch (err) {
      res.status(404).send({ message: `Error happening ...`});
    }
  }
};
