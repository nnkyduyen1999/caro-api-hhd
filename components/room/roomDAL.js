const Room = require("./roomModel");

module.exports = {
  all: () => {
    return Room.find({})
  },

  getRoomById: (id) => {
    return Room.findOne(
      { _id: id },
      { password: 0 }
    );
  },

  updateXCurrentPlayer: (roomId, xPlayerId) => {
    return Room.findByIdAndUpdate(roomId, { xCurrentPlayer: xPlayerId })
  },

  updateOCurrentPlayer: (roomId, oPlayerId) => {
    return Room.findByIdAndUpdate(roomId, { oCurrentPlayer: oPlayerId })
  },

  updateXPlayerReady: (roomId, status) => {
    return Room.findByIdAndUpdate(roomId, { xPlayerReady: status })
  },

  updateOPlayerReady: (roomId, status) => {
    return Room.findByIdAndUpdate(roomId, { oPlayerReady: status })
  },



  //------------------------------
  insert: async (userXId, userOId) => {
    try {
      const room = {
        xCurrentPlayer: userXId,
        oCurrentPlayer: userOId,
      };
      const createdRoom = await Room.create(room);
      return createdRoom;
    } catch (err) {
      return { message: err.message };
    }
  },

  addToDB: async (dataFromSocket) => {
    try {
      const room = {
        password: dataFromSocket.password,
        timeStep: dataFromSocket.timeStep,
        xCurrentPlayer: dataFromSocket.userId,
        isPlaying: false
      }
      return await Room.create(room);
    } catch (err) {
      return { message: err.message };
    }
  }, 

  // testRoom: async (req, res, next) => {
  //   try {
  //     // const createdRoom = await Room.create(room);
  //     const createdRoom = await Room.create({});
  //     res.send({createdRoom})
  //   } catch (err) {
  //     res.send({err})
  //   }
  // },

  loadById: async (id) => {
    try {
      const room = await Room.findById(id);
      return room;
    } catch (err) {
      return { message: err.message };
    }
  },
};
