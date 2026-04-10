const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const rooms = {}; // Store room state

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = { host: socket.id, users: [], currentSong: null, isPlaying: false, currentTime: 0, lastUpdate: Date.now() };
    }
    rooms[roomId].users.push(socket.id);
    console.log(`${socket.id} joined room ${roomId}`);
    
    // Sync new user with current room state
    socket.emit('room-state', rooms[roomId]);
    io.to(roomId).emit('user-count', rooms[roomId].users.length);
  });

  socket.on('leave-room', (roomId) => {
    socket.leave(roomId);
    if (rooms[roomId]) {
      rooms[roomId].users = rooms[roomId].users.filter(id => id !== socket.id);
      io.to(roomId).emit('user-count', rooms[roomId].users.length);
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId]; // Clean up empty rooms
      }
    }
  });

  socket.on('play', (roomId) => {
    if (rooms[roomId]) rooms[roomId].isPlaying = true;
    socket.to(roomId).emit('play');
  });

  socket.on('pause', (roomId) => {
    if (rooms[roomId]) rooms[roomId].isPlaying = false;
    socket.to(roomId).emit('pause');
  });

  socket.on('sync-time', ({ roomId, time }) => {
    if (rooms[roomId]) {
      rooms[roomId].currentTime = time;
      rooms[roomId].lastUpdate = Date.now();
    }
    socket.to(roomId).emit('sync-time', time);
  });

  socket.on('change-song', ({ roomId, song }) => {
    if (rooms[roomId]) {
        rooms[roomId].currentSong = song;
        rooms[roomId].currentTime = 0;
        rooms[roomId].isPlaying = true;
    }
    socket.to(roomId).emit('change-song', song);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      rooms[roomId].users = rooms[roomId].users.filter(id => id !== socket.id);
      io.to(roomId).emit('user-count', rooms[roomId].users.length);
      if (rooms[roomId].users.length === 0) {
        delete rooms[roomId];
      }
    }
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Melodify Listen-Along Server running on port ${PORT}`);
});
