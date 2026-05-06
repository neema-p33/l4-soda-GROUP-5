const socket = io();

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const joinBtn = document.getElementById('join-btn');
const sendBtn = document.getElementById('send-btn');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');
const messages = document.getElementById('messages');

// Join the chat
joinBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (!username) return alert('Please enter a username!');
  
  socket.emit('join', username);
  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');
});

// Send a message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;
  socket.emit('chat message', msg);
  messageInput.value = '';
}

// Receive messages
socket.on('message', (data) => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight; // Auto-scroll
});
