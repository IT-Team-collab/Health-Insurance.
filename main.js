document.addEventListener('DOMContentLoaded', () => {
    // Search functionality
    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.querySelector('.search-overlay');
    
    if (searchToggle && searchOverlay) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            searchOverlay.querySelector('input').focus();
        });

        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }

    // Chat functionality
    const chatToggle = document.querySelector('.chat-toggle');
    const chatBox = document.querySelector('.chat-box');
    const closeChat = document.querySelector('.close-chat');
    
    if (chatToggle && chatBox) {
        let isExpanding = false;
        
        chatToggle.addEventListener('click', () => {
            if (isExpanding) return;
            isExpanding = true;
            
            chatBox.style.display = 'block';
            // Trigger reflow
            chatBox.offsetHeight;
            
            chatBox.classList.add('active');
            chatToggle.querySelector('.notification-badge').style.display = 'none';
            
            // Reset flag after animation completes
            setTimeout(() => {
                isExpanding = false;
            }, 300);
        });

        if (closeChat) {
            closeChat.addEventListener('click', () => {
                chatBox.classList.remove('active');
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    chatBox.style.display = 'none';
                }, 300);
            });
        }

        // Handle chat input
        const chatInput = chatBox.querySelector('input');
        const chatSendButton = chatBox.querySelector('button');
        const chatMessages = chatBox.querySelector('.chat-messages');

        function sendMessage(message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message user';
            messageElement.style.opacity = '0';
            messageElement.innerHTML = `
                <p>${message}</p>
            `;
            
            chatMessages.appendChild(messageElement);
            
            // Trigger animation
            requestAnimationFrame(() => {
                messageElement.style.opacity = '1';
                messageElement.style.transform = 'translateY(0)';
            });
            
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Simulate response after 1 second
            setTimeout(() => {
                const responseElement = document.createElement('div');
                responseElement.className = 'message support';
                responseElement.style.opacity = '0';
                responseElement.innerHTML = `
                    <img src="images/support-avatar.png" alt="Support">
                    <p>Thanks for your message! Our team will get back to you soon.</p>
                `;
                
                chatMessages.appendChild(responseElement);
                
                requestAnimationFrame(() => {
                    responseElement.style.opacity = '1';
                    responseElement.style.transform = 'translateY(0)';
                });
                
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 1000);
        }

        chatSendButton.addEventListener('click', () => {
            const message = chatInput.value.trim();
            if (message) {
                sendMessage(message);
                chatInput.value = '';
            }
        });

        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = chatInput.value.trim();
                if (message) {
                    sendMessage(message);
                    chatInput.value = '';
                }
            }
        });
    }
}); 