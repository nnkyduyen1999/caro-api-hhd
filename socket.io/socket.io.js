const roomDAL = require("../components/room/roomDAL");

let onlineUsers = [];
let matchingUsers = [];
const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
const GIVEN_IN_EVENT = "give-in"
module.exports = (io, socket) => {
    //listen for new connection
    socket.on("new-connection", (user) => {
        if (!onlineUsers.some((item) => item.userId === user._id)) {
            onlineUsers.push({
                userId: user._id,
                socketId: socket.id,
                username: user.username,
            });
            io.emit("update-online-users", onlineUsers);
        }
    });

    socket.on("matching", async (user) => {
        if (matchingUsers.length >= 1) {
            //create room
            const createdRoom = await roomDAL.insert(
                matchingUsers[0].userId,
                user._id
            );

            data = {
                _id: createdRoom._id,
                userXId: createdRoom.userXId,
                usernameX: matchingUsers[0].username,
                userOId: createdRoom.userOId,
                usernameO: user.username,
            };

            //send message to users
            socket.broadcast
                .to(matchingUsers[0].socketId)
                .emit("successfullyMatched", data);
            socket.emit("successfullyMatched", data);

            matchingUsers.shift();
        } else {
            if (!matchingUsers.some((item) => item._id === user._id)) {
                matchingUsers.push({
                    userId: user._id,
                    socketId: socket.id,
                    username: user.username,
                });
            }
        }
    });

    //Join a room
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
    });

    socket.on("requestMove", (data) => {
        // console.log("req", data, data.roomId);
        io.to(data.roomId).emit("acceptedMove", data);
    });

    // Listen for new messages
    socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
        io.in(data.roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
    });

    socket.on(GIVEN_IN_EVENT, (data) => {
        console.log("req", data);
        io.in(data.roomId).emit(GIVEN_IN_EVENT, data);
    });

    socket.on("disconnect", (user) => {
        if (onlineUsers.some((item) => item._id === user._id)) {
            const temp = onlineUsers.filter((item) => item._id !== user._id);
            onlineUsers = [...temp];
            io.emit("update-online-users", onlineUsers);
        }
        // Leave the room if the user closes the socket
        socket.leave(roomId);
    });
};
