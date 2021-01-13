const { allWithPlayerUsername } = require("../room/roomController");
const userDAL = require("../user/userDAL");
const Game = require("./gameModel");
const {BOARD_SIZE} = require('../../global/constant')

module.exports = {
  getGameById: async (req, res, next) => {
    const gameId = req.params.id;
    const result = await Game.findById(gameId);

    res.status(200).json({
      game: result,
    });
  },

  getGameWithBoardHistory: async (req, res, next) => {
    try {
      const gameId = req.params.id;
      const game = await Game.findById(gameId);
      const xPlayer = await userDAL.loadUsernameById(game.xPlayer);
      const oPlayer = await userDAL.loadUsernameById(game.oPlayer);
      const history = []

      history.push({
        squares: Array(BOARD_SIZE * BOARD_SIZE).fill(null),
        location: null,
        messages: []
      });

      for (const item of game.history) {
        const curr = { squares: [...history[history.length - 1].squares], location: null }
        curr.squares[item.location] = item.player
        curr.location = item.location
        curr.messages = item.messages
        history.push({squares: [...curr.squares], location: curr.location, messages: [...curr.messages]})
      }

      // console.log(history);

      res.status(200).send({
        ...game._doc,
        xPlayerUsername: xPlayer ? xPlayer.username : '',
        oPlayerUsername: oPlayer ? oPlayer.username : '',
        history: [...history]
      })
    } catch (err) {
      res.send(err)
    }


  },
};
