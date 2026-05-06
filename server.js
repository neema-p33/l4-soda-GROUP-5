const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

// Track connected users: { socketId -> { username, room } }
const users = {};

// Track typing users per room: { room -> Set of usernames }
const typingUsers = {};

// ──────────────────────────────────────────────
// Helper utilities
// ──────────────────────────────────────────────

/** Return all usernames in a given room */
function getUsersInRoom(room) {
  return Object.values(users)
    .filter((u) => u.room === room)
    .map((u) => u.username);
}

/** Build a system message object */
function systemMessage(text) {
  return {
    type: "system",
    text,
    timestamp: new Date().toISOString(),
  };
}

/** Build a chat message object */
function chatMessage({ username, text, room }) {
  return {
    type: "chat",
    username,
    text,
    room,
    timestamp: new Date().toISOString(),
  };
}

// ──────────────────────────────────────────────
// Socket.io event handling
// ──────────────────────────────────────────────

io.on("connection", (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`);

  // ── Join room ──────────────────────────────
  socket.on("join", ({ username, room }) => {
    // Validate input
    if (!username || !room) return;

    const trimmedUsername = username.trim().substring(0, 20);
    const trimmedRoom = room.trim().substring(0, 30);

    // Register user
    users[socket.id] = { username: trimmedUsername, room: trimmedRoom };

    // Join the Socket.io room
    socket.join(trimmedRoom);

    console.log(`[>] ${trimmedUsername} joined room: ${trimmedRoom}`);

    // Notify the joining user
    socket.emit("joined", {
      username: trimmedUsername,
      room: trimmedRoom,
      users: getUsersInRoom(trimmedRoom),
    });

    // Notify others in the room
    socket.to(trimmedRoom).emit("message", systemMessage(`${trimmedUsername} joined the chat`));

    // Update user list for everyone in the room
    io.to(trimmedRoom).emit("roomUsers", {
      room: trimmedRoom,
      users: getUsersInRoom(trimmedRoom),
    });
  });

  // ── Chat message ───────────────────────────
  socket.on("chatMessage", (text) => {
    const user = users[socket.id];
    if (!user) return;

    const trimmedText = text.trim().substring(0, 500);
    if (!trimmedText) return;

    const msg = chatMessage({ username: user.username, text: trimmedText, room: user.room });

    // Broadcast to everyone in the room (including sender)
    io.to(user.room).emit("message", msg);

    console.log(`[msg] ${user.username} (${user.room}): ${trimmedText}`);
  });

  // ── Typing indicator ───────────────────────
  socket.on("typing", (isTyping) => {
    const user = users[socket.id];
    if (!user) return;

    const { username, room } = user;

    if (!typingUsers[room]) typingUsers[room] = new Set();

    if (isTyping) {
      typingUsers[room].add(username);
    } else {
      typingUsers[room].delete(username);
    }

    // Broadcast typing list to others in the room
    socket.to(room).emit("typingUsers", Array.from(typingUsers[room]));
  });

  // ── Disconnect ─────────────────────────────
  socket.on("disconnect", () => {
    const user = users[socket.id];
    if (!user) return;

    const { username, room } = user;
    delete users[socket.id];

    // Remove from typing list
    if (typingUsers[room]) {
      typingUsers[room].delete(username);
      socket.to(room).emit("typingUsers", Array.from(typingUsers[room]));
    }

    // Notify room
    io.to(room).emit("message", systemMessage(`${username} left the chat`));
    io.to(room).emit("roomUsers", {
      room,
      users: getUsersInRoom(room),
    });

    console.log(`[-] ${username} disconnected from room: ${room}`);
  });
});

// ──────────────────────────────────────────────
// Start server
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🚀  Chat server running at http://localhost:${PORT}\n`);
});
