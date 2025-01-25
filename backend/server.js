const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require("http");
const userRouter = require('./routes/userRoutes');
const socketio = require('socket.io');
const socketIo = require('./socket');
const cors = require('cors');
const groupRouter = require('./routes/groupRoutes');
const messageRouter = require('./routes/messageRoutes');
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

//middleware
app.use(cors())
app.use(express.json()) //middleware to pass incoming json data

//connect to db
mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to DB"))
    .catch((err) => console.log('MongoDB connection failed', err))

//initialize socket config
socketIo(io);
//our routes
app.use('/api/users', userRouter);
app.use('/api/groups', groupRouter);
app.use('/api/messages', messageRouter);

//start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, console.log('Server is running on Port ', PORT));