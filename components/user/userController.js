// const User = require('./userModel')
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
};
