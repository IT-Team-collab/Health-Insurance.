class LiveSupport {
    constructor() {
        this.chatBox = document.querySelector('.chat-box');
        this.chatToggle = document.querySelector('.chat-toggle');
        this.chatMessages = document.querySelector('.chat-messages');
        this.chatInput = document.querySelector('.chat-input input');
        this.chatSendButton = document.querySelector('.chat-input button');
        this.closeChat = document.querySelector('.close-chat');
        this.isOpen = false;
        
        this.init();
    }

    init() {
        if (!this.chatBox) return;

        this.setupEventListeners();
        this.loadInitialMessage();
    }

    setupEventListeners() {
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        this.closeChat.addEventListener('click', () => this.closeSupport());
        this.chatSendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        if (!this.isOpen) {
            this.chatBox.style.display = 'block';
            setTimeout(() => {
                this.chatBox.classList.add('active');
                this.chatInput.focus();
            }, 10);
        } else {
            this.closeSupport();
        }
        this.isOpen = !this.isOpen;
        this.chatToggle.querySelector('.notification-badge').style.display = 'none';
    }

    closeSupport() {
        this.chatBox.classList.remove('active');
        setTimeout(() => {
            this.chatBox.style.display = 'none';
        }, 300);
        this.isOpen = false;
    }

    loadInitialMessage() {
        const initialMessage = {
            type: 'support',
            content: 'Hello! How can I help you today?',
            time: new Date()
        };
        this.addMessage(initialMessage);
    }

    sendMessage() {
        const content = this.chatInput.value.trim();
        if (!content) return;

        // User message
        const userMessage = {
            type: 'user',
            content: content,
            time: new Date()
        };
        this.addMessage(userMessage);
        this.chatInput.value = '';

        // Simulate support response
        setTimeout(() => {
            const supportMessage = {
                type: 'support',
                content: this.generateResponse(content),
                time: new Date()
            };
            this.addMessage(supportMessage);
        }, 1000);
    }

    addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        messageElement.innerHTML = `
            ${message.type === 'support' ? '<img src="images/support-avatar.png" alt="Support">' : ''}
            <p>${message.content}</p>
            <span class="time">${this.formatTime(message.time)}</span>
        `;
        
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    generateResponse(message) {
        const responses = {
            default: "Thank you for your message. A support representative will get back to you shortly.",
            claims: "For claims-related questions, please visit our claims page or call our claims department at 1-800-CLAIMS.",
            coverage: "We offer various coverage options. You can view them in detail on our benefits page.",
            emergency: "If this is a medical emergency, please call 911 immediately."
        };

        message = message.toLowerCase();
        if (message.includes('claim')) return responses.claims;
        if (message.includes('coverage')) return responses.coverage;
        if (message.includes('emergency')) return responses.emergency;
        return responses.default;
    }
}

// Initialize Live Support
document.addEventListener('DOMContentLoaded', () => {
    new LiveSupport();
}); 