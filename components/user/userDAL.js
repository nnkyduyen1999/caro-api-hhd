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

  updateTrophyById: async (id, bonusTrophy) => {
    // console.log(bonusTrophy, id);
    // const user = await User.findOneAndUpdate({_id: id}, { $inc: { trophy: bonusTrophy } }, (err) => {
    //   console.log(err)
    // });
    // console.log("user",user);
    return User.findOneAndUpdate(
      { _id: id },
      { $inc: { trophy: bonusTrophy } },
      (err) => {
        console.log(err);
      }
    );
  },

  getTopPlayersDAL: () => {
    return User.find({}).sort({ trophy: "desc" }).limit(10);
  },
};
