const Room = require('./roomModel')

module.exports = {
    insert: async (userXId, userOId) => {
        try {
            const room = {
                userXId: userXId,
                userOId: userOId
            }
            const createdRoom = await Room.create(room)
            return createdRoom
        } catch (err) {
            return {message: err.message}
        }
    }
}