const User = require("./userModel");

module.exports = {
  updateOnlineStatus: (id, status) => {
    return User.updateOne({ _id: id }, { isOnline: status });
  },

  getOnlineUsers: () => {
    return User.find(
      { isOnline: true, isAdmin: false, isBlock: false, isValidate: true },
      { _id: 1, username: 1 }
    );
  },

  loadUsernameById: (id) => {
    return User.findById(id).select("username")
  }
};
