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
    return User.findById(id, {username: 1, trophy: 1});
  },

  loadTrophyById: (id) => {
    return User.findById(id).select("trophy");
  },

  updateWinnerById: async (id, bonusTrophy) => {
    console.log("update winner");
    return User.findOneAndUpdate(
      { _id: id },
      { $inc: { trophy: bonusTrophy } },
      {new: true}
    );
  },
  updateLoserById: async (id, trophy) => {
    console.log("update loser");
    return User.findOneAndUpdate(
      { _id: id },
      { $inc: { trophy: -trophy } },
      {new: true}
    );
  },

  getTopPlayersDAL: () => {
    return User.find({}).sort({ trophy: "desc" }).limit(10);
  },
};
