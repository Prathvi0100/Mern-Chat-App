const socketIo = (io) => {
    //store connected users with their room info using socket.io as their key
    const connectedUsers = new Map()

    //Handle new socket connections
    io.on('connection', (socket) => {
        //get user from authentication
        const user = socket.handshake.auth.user;
        console.log('User connected', user?.username);
        //! Start : Join room handler
        socket.on("join room", (groupId) => {
            //Add socket to the specified room
            socket.join(groupId);
            // store user and room info in connectedUsers Map
            connectedUsers.set(socket.id, { user, room: groupId });
            //get list of all users currently in the room
            const usersInRoom = Array.from(connectedUsers.values()).filter((u) => u.room === groupId).map((u) => u.user);
            //Emit updated users list to all clients in the room
            io.in(groupId).emit("users in room", usersInRoom);
            //Broadcast join notification to all other users in the room
            socket.to(groupId).emit('notification', {
                type: 'USER_JOINED',
                message: `${user?.username} has joined`,
                user: user
            });
        });
        //! End : Join room handler

        //! Start : Leave room handler
        //Triggered when user manually leaves a room
        socket.on('leave room', (groupId) => {
            console.log(`${user?.username} leaving room`.groupId);
            //remove socket from the room
            socket.leave(groupId);
            if (connectedUsers.has(socket.id)) {
                //remove user from connected users and notify oters
                connectedUsers.delete(socket.id);
                socket.io(groupId).emit('user left', user?._id);
            }
        });
        //! End : Leave room handler

        //! Start : New Message room handler
        //Triggered when user sends a new message
        socket.on('new message', (message) => {
            //BroadCast message to all other users in the room
            socket.to(message.groupId).emit('message received', message);
        });
        //! End : New Message room handler

        //! Start : Disconnect handler
        //Triggered when user closes the connection
        socket.on("disconnect", () => {
            console.log(`${user?.username} disconnected`);
            if (connectedUsers.has(socket.id)) {
                //get user's room info before removing
                const userData = connectedUsers.get(socket.id);
                //Notify others in the room about user's departure
                socket.to(userData.room).emit('user left', user?._id);
                //remove user from connected users
                connectedUsers.delete(socket.id);
            }
        })
        //! End : Disconnect handler

        //! Start : Typing Indicator handler
        //Triggered when user starts typing
        socket.on('typing', ({ groupId, username }) => {
            //broadcast typing status to other users in the room
            socket.to(groupId).emit('user typing', { username });
        })
        socket.on('stop typing', ({ groupId }) => {
            //broadcast stop typing status to other users in the room
            socket.to(groupId).emit('user stopped typing', { username: user?.username });
        })
        //! End : Typing Indicator handler
    })
};

module.exports = socketIo;