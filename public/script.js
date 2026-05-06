// iChat — White Glass Design | Custom Name Feature

// DOM Elements
const messagesContainer = document.getElementById('messageList');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendBtn');
const totalClientsSpan = document.getElementById('totalClients');
const userNameInput = document.getElementById('userNameInput');

// State: active clients counter (starts at 2 as per image)
let activeClients = 2;
totalClientsSpan.innerText = `Total clients: ${activeClients}`;

// Get current display name (if empty → "anonymous")
function getCurrentDisplayName() {
    let rawName = userNameInput.value.trim();
    if (rawName === "") return "anonymous";
    return rawName;
}

// Light emoji based on name first letter
function getAvatarEmoji(name) {
    if (!name || name === "anonymous") return "🕊️";
    const letter = name.charAt(0).toUpperCase();
    const emojiSet = {
        'A': '🌸', 'B': '⭐', 'C': '🌊', 'D': '🎵', 'E': '✨', 'F': '🍃', 'G': '💎',
        'H': '🌙', 'I': '📖', 'J': '☕', 'K': '🔮', 'L': '🍀', 'M': '🎧', 'N': '🌼',
        'O': '🍊', 'P': '🎨', 'Q': '🌀', 'R': '⚡', 'S': '❄️', 'T': '🌻', 'U': '🌈',
        'V': '🍇', 'W': '☁️', 'X': '💫', 'Y': '🌟', 'Z': '⚡'
    };
    return emojiSet[letter] || '💧';
}

// Escape HTML to prevent injection
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Add message with custom user name
function addMessage(text, customName = null, isSystem = false) {
    if (!text.trim()) return;

    let senderName;
    if (customName !== null) {
        senderName = customName;
    } else {
        senderName = getCurrentDisplayName();
    }

    if (!senderName || senderName.trim() === "") senderName = "anonymous";

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    const senderDiv = document.createElement('div');
    senderDiv.className = 'message-sender';

    const avatar = isSystem ? '✨' : getAvatarEmoji(senderName);
    const badgeText = senderName === "anonymous" ? "Anon" : senderName.substring(0, 2).toUpperCase();

    senderDiv.innerHTML = `
        <span>${avatar} ${escapeHtml(senderName)}</span>
        <span class="name-icon">${escapeHtml(badgeText)}</span>
    `;

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerText = text;

    messageDiv.appendChild(senderDiv);
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);

    // Subtle highlight effect
    bubble.style.transition = "all 0.2s";
    bubble.style.boxShadow = "0 0 0 1px rgba(255,255,245,0.8), 0 4px 12px rgba(0,0,0,0.02)";
    setTimeout(() => {
        if (bubble) bubble.style.boxShadow = "";
    }, 350);

    // Auto-scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Increment total clients counter
function incrementTotalClients() {
    if (activeClients < 99) {
        activeClients++;
        totalClientsSpan.innerText = `Total clients: ${activeClients}`;
        totalClientsSpan.style.transform = "scale(1.04)";
        setTimeout(() => {
            if (totalClientsSpan) totalClientsSpan.style.transform = "";
        }, 200);
    } else {
        totalClientsSpan.style.transform = "scale(1.02)";
        setTimeout(() => {
            if (totalClientsSpan) totalClientsSpan.style.transform = "";
        }, 150);
    }
}

// Handle sending a new message
function handleSendMessage() {
    const msg = messageInput.value.trim();
    if (msg === "") return;

    const currentSender = getCurrentDisplayName();
    addMessage(msg, currentSender, false);

    // Button animation
    sendButton.style.transform = "scale(0.92)";
    setTimeout(() => {
        if (sendButton) sendButton.style.transform = "";
    }, 120);

    incrementTotalClients();
    messageInput.value = "";
    messageInput.focus();
}

// Name change notification (gentle system message)
let previousUserName = userNameInput.value.trim();

function notifyNameChange(oldName, newName) {
    if (oldName === newName) return;
    if (newName !== "" && oldName !== "") {
        addMessage(`🎭 Name changed to ${escapeHtml(newName)}`, "💎 system", true);
    } else if (newName === "" && oldName !== "") {
        addMessage(`🕊️ Switched to anonymous`, "💎 system", true);
    } else if (newName !== "" && oldName === "") {
        addMessage(`👋 Hello, ${escapeHtml(newName)}!`, "💎 system", true);
    }
}

// Debounced name change detection
let nameChangeTimer;
userNameInput.addEventListener('input', function () {
    clearTimeout(nameChangeTimer);
    nameChangeTimer = setTimeout(() => {
        const current = userNameInput.value.trim();
        if (current !== previousUserName) {
            notifyNameChange(previousUserName, current);
            previousUserName = current;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, 700);
});

// Also handle blur for immediate update
userNameInput.addEventListener('blur', function () {
    const current = userNameInput.value.trim();
    if (current !== previousUserName) {
        notifyNameChange(previousUserName, current);
        previousUserName = current;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});

// Event listeners for sending messages
sendButton.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleSendMessage();
    }
});

// Liquid glass interactive mouse move effect
const glassCard = document.querySelector('.chat-app');
if (glassCard) {
    glassCard.addEventListener('mousemove', (e) => {
        const rect = glassCard.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const shimmer = glassCard.querySelector('.liquid-shimmer');
        if (shimmer) {
            const moveX = (x - 0.5) * 18;
            const moveY = (y - 0.5) * 18;
            shimmer.style.transform = `translate(${moveX * 0.25}px, ${moveY * 0.25}px) rotate(1deg)`;
        }
    });

    glassCard.addEventListener('mouseleave', () => {
        const shimmer = glassCard.querySelector('.liquid-shimmer');
        if (shimmer) shimmer.style.transform = "translate(-5%, -5%) rotate(0deg)";
    });
}

// Ripple effect on clients count click
totalClientsSpan.addEventListener('click', (e) => {
    const rippleCircle = document.createElement('span');
    rippleCircle.style.position = 'fixed';
    rippleCircle.style.width = '28px';
    rippleCircle.style.height = '28px';
    rippleCircle.style.borderRadius = '50%';
    rippleCircle.style.background = 'radial-gradient(circle, rgba(140,180,220,0.3), transparent)';
    rippleCircle.style.pointerEvents = 'none';
    rippleCircle.style.transform = 'scale(0)';
    rippleCircle.style.transition = 'transform 0.4s ease-out, opacity 0.4s';
    rippleCircle.style.opacity = '0.7';
    rippleCircle.style.zIndex = '999';

    const rect = totalClientsSpan.getBoundingClientRect();
    rippleCircle.style.left = `${rect.left + rect.width / 2 - 14}px`;
    rippleCircle.style.top = `${rect.top + rect.height / 2 - 14}px`;

    document.body.appendChild(rippleCircle);

    requestAnimationFrame(() => {
        rippleCircle.style.transform = 'scale(8)';
        rippleCircle.style.opacity = '0';
    });

    setTimeout(() => rippleCircle.remove(), 450);
});

// Initialize previous username
previousUserName = userNameInput.value.trim();

// Add a friendly tip message after load if name is empty
setTimeout(() => {
    if (!userNameInput.value.trim()) {
        const tipMsg = document.createElement('div');
        tipMsg.className = 'message';
        const tipSender = document.createElement('div');
        tipSender.className = 'message-sender';
        tipSender.innerHTML = `<span>📝 hint</span><span class="name-icon">tip</span>`;
        const tipBubble = document.createElement('div');
        tipBubble.className = 'message-bubble';
        tipBubble.innerText = '💡 Write your name in the ✍️ field above — messages will show it instantly!';
        tipMsg.appendChild(tipSender);
        tipMsg.appendChild(tipBubble);
        messagesContainer.appendChild(tipMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}, 500);

// Auto-scroll to bottom on page load
messagesContainer.scrollTop = messagesContainer.scrollHeight;