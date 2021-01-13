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
    const { gameId, winningLine, isFinish, winner } = data;
    return Game.findByIdAndUpdate(gameId, {
      winningLine: winningLine,
      isFinish: isFinish,
      winner: winner,
    });
  },

  getLatestGameInRoomById: (roomId) => {
    return Game.findOne({ roomId: roomId }, {}, { sort: { createdTime: -1 } });
  },

  updateGameHistory: (gameId, newHistory) => {
    return Game.findByIdAndUpdate(gameId, { $push: { history: newHistory } });
  },

  getFinishedGamesByUserIdDAL: (userId) => {
    return Game.find().or([{ xPlayer: userId }, { oPlayer: userId }]);
  },
};
