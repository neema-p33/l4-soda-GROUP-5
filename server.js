const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve frontend files
app.use(express.static('public'));

// Handle socket connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for a user joining with a username
  socket.on('join', (username) => {
    socket.username = username;
    io.emit('message', { user: 'System', text: `${username} has joined the chat!` });
  });

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    io.emit('message', { user: socket.username, text: msg });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      io.emit('message', { user: 'System', text: `${socket.username} has left the chat.` });
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});