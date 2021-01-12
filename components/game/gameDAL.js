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

  updateGameResult: (gameId, winningLine, winner) => {
    return;
  },

  getLatestGameInRoomById: (roomId) => {
    return Game.findOne({ roomId: roomId }, {}, { sort: { createdTime: -1 } });
  },

  updateGameHistory: (gameId, newHistory) => {
    return Game.findByIdAndUpdate(gameId, { $push: { history: newHistory } });
  },
};
