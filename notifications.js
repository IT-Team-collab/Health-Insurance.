class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        // Create notification container
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    push(message, type = 'info') {
        const notification = {
            id: Date.now(),
            message,
            type
        };
        this.notifications.push(notification);
        this.display(notification);
    }

    display(notification) {
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.innerHTML = `
            <p>${notification.message}</p>
            <button class="close-notification">&times;</button>
        `;
        
        document.querySelector('.notification-container').appendChild(element);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            element.remove();
        }, 5000);
    }
} 