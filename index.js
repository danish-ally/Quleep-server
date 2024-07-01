const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',
    },
});
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

let registeredUsers = {};

io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('register', (userId) => {
        if (!registeredUsers[userId]) {
            registeredUsers[userId] = { socketIds: [] };
        }
        registeredUsers[userId].socketIds.push(socket.id);
        console.log(`User ${userId} connected with socket ID: ${socket.id}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
        for (const userId in registeredUsers) {
            registeredUsers[userId].socketIds = registeredUsers[userId].socketIds.filter(id => id !== socket.id);
            if (registeredUsers[userId].socketIds.length === 0) {
                delete registeredUsers[userId];
            }
        }
    });
});

app.post('/trigger-ringtone', (req, res) => {
    for (const userId in registeredUsers) {
        registeredUsers[userId].socketIds.forEach(socketId => {
            io.to(socketId).emit('trigger-ringtone');
        });
    }
    res.status(200).send({ message: 'Triggering ringtone for all registered users' });
});

app.post('/register', (req, res) => {
    return
});
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
