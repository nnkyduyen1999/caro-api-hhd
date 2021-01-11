const Game = require('./gameModel')

module.exports = {
    getGameById: async (req, res, next) => {
        const gameId  = req.params.id;
        const result = await Game.findById(gameId);
        // console.log(result);
        res.status(200).json({
            game: result
        })
    },

    
    // testGame: async (req, res, next) => {
    //     const newGame = {
    //         roomId: "5ff80deb92a19d20c499fba0",
    //     };
    //
    //     const result = await Game.create(newGame);
    //     // console.log(result);
    //     res.status(200).json({
    //         game: result
    //     })
    // }
}
