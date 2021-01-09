const RoomDAL = require("./roomDAL");
const UserDAL = require("../user/userDAL");
const Room = require("./roomModel");

module.exports = {
    all: async (req, res, next) => {
        try {
            const rooms = await RoomDAL.all();
            const roomsWithUsername = [];
            for (let item of rooms) {
                const xPlayer = item.xCurrentPlayer
                    ? await UserDAL.loadUsernameById(item.xCurrentPlayer)
                    : "";
                const oPlayer = item.oCurrentPlayer
                    ? await UserDAL.loadUsernameById(item.oCurrentPlayer)
                    : "";
                roomsWithUsername.push({
                    ...item._doc,
                    xPlayerUsername: xPlayer ? xPlayer.username : "",
                    oPlayerUsername: oPlayer ? oPlayer.username : "",
                });
            }

            res.send(roomsWithUsername);
        } catch (err) {
            res.send(err);
        }
    },
    getById: async (req, res, next) => {
        const roomId = req.params.id;

        try {
            const room = await Room.findById(roomId);
            if(room) {
                return res.status(200).json({room});
            }
            return res.status(400).json({message: 'room not found'})
        } catch (err) {
            res.status(500).send(err);
        }
    }
};