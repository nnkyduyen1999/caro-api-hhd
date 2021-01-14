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

  updateWinnerById: (id, bonusTrophy) => {
    return User.findOneAndUpdate(
      { _id: id },
      { $inc: { trophy: bonusTrophy, total: 1, winCount: 1} },
      {new: true}
    );
  },
  updateLoserById: (id, trophy) => {
    return User.findOneAndUpdate(
      { _id: id },
      { $inc: { trophy: -trophy, total: 1, loseCount: 1 } },
      {new: true}
    );
  },
  updateDrawById: (id) => {
    return User.findOneAndUpdate(
      { _id: id },
      { $inc: { total: 1 } },
      {new: true}
    );
  },

  getTopPlayersDAL: () => {
    return User.find({isAdmin: false}).sort({ trophy: "desc" }).limit(10);
  },

  getUserByIdDAL: (id) => {
    return User.findById(id);
  }

};
