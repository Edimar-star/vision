require('dotenv').config();
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

var users = {};

var socketToRoom = {};

io.on('connection', socket => {

    socket.on("join room", (data) => {
        socket.join(data.roomID);

        if (users[data.roomID]) {
            users[data.roomID].push(data);
        } else {
            users[data.roomID] = [data];
        }
        socketToRoom[data.id] = data.roomID;
        socket.room = data.roomID;
        socket.username = data.username;
        const usersInThisRoom = users[data.roomID].filter(p => p.id !== data.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("into", (room) => {
        var existeReunion = false;
        for (let [id, socket] of io.of("/").sockets) {
            if (room === socket["room"]) {
                existeReunion = true;
                if (users[room].length === 4) {
                    socket.emit("room-full");
                }
            }
        }
        socket.emit("existe-room", existeReunion);
    })

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID, username: payload.username });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
    })

    socket.on('disconnect', () => {
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(p => p.id !== socket.id);
            users[roomID] = room;
            if (users[roomID].length === 0) {
                var usuarios = {};
                for (let user in users) {
                    if (users[roomID] !== users[user]) {
                        usuarios[user] = users[user];
                    }
                }
                users = usuarios;
            } else {
                socket.to(roomID).emit("out-room", { username: socket.username, id: socket.id });
            }
        }
    });

});

server.listen(process.env.PORT || 3001, () => console.log('server is running on port 3001'));