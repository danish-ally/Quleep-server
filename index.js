const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname, '../client/build')));

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('audio', (data) => {
        // Broadcast the audio data to all connected clients (admin)
        socket.broadcast.emit('audio', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Server running on port ${port}`));
