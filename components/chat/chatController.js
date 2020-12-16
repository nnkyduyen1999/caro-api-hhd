const Game = require('../game/gameModel')

module.exports = {
    joinChatById: async (req, res, next) => {
        const gameId  = req.params.id;
        const result = await Game.findById(gameId);
        // console.log(result);
        res.status(200).json({
            game: result
        })
    }
}
