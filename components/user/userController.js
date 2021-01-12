const UserDAL = require("./userDAL");

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
  }
};
