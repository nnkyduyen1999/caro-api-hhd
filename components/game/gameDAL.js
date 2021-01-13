const Game = require("./gameModel");

module.exports = {
  insert: (roomId, xPlayer, oPlayer) => {
    const game = {
      roomId: roomId,
      xPlayer: xPlayer,
      oPlayer: oPlayer,
    };
    return Game.create(game);
  },

  updateGameResult: (data) => {
    const {gameId, winningLine, winner} = data;
    return Game.findByIdAndUpdate(gameId, {
      winningLine: winningLine,
      isFinish: true,
      winner: winner
    });
  },

  getLatestGameInRoomById: (roomId) => {
    return Game.findOne({ roomId: roomId }, {}, { sort: { createTime: -1 }});
  },

  updateGameHistory: (gameId, newHistory) => {
    return Game.findByIdAndUpdate(gameId, { $push: { history: newHistory } });
  },

  getFinishedGamesByUserIdDAL: (userId) => {
    return Game.find()
      .or([{ xPlayer: userId }, { oPlayer: userId }])
      .and([{ isFinish: true }]);
  },


};
