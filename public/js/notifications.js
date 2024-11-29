class NotificationManager {
    constructor() {
        this.container = document.getElementById('notifications-container');
        this.badge = document.getElementById('notifications-badge');
        this.unreadCount = 0;
        this.notifications = [];
        
        this.initialize();
    }

    async initialize() {
        await this.loadNotifications();
        this.startPolling();
        this.setupEventListeners();
    }

    async loadNotifications() {
        try {
            const response = await fetch('/notifications');
            const data = await response.json();
            
            this.notifications = data;
            this.updateUnreadCount();
            this.renderNotifications();
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }

    updateUnreadCount() {
        this.unreadCount = this.notifications.filter(n => !n.read).length;
        this.badge.textContent = this.unreadCount || '';
        this.badge.style.display = this.unreadCount ? 'block' : 'none';
    }

    renderNotifications() {
        const notificationsList = document.createElement('div');
        notificationsList.className = 'notifications-list';

        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications</p>
                </div>
            `;
        } else {
            this.notifications.forEach(notification => {
                notificationsList.appendChild(this.createNotificationElement(notification));
            });
        }

        this.container.innerHTML = '';
        this.container.appendChild(notificationsList);
    }

    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.read ? 'read' : 'unread'}`;
        element.dataset.id = notification.id;

        const icon = this.getNotificationIcon(notification.type);
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-details">
                    <p class="notification-message">${notification.message}</p>
                    <span class="notification-time">
                        ${moment(notification.created_at).fromNow()}
                    </span>
                </div>
                <button class="mark-read-btn" title="Mark as read">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `;

        element.querySelector('.mark-read-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.markAsRead(notification.id);
        });

        return element;
    }

    getNotificationIcon(type) {
        const icons = {
            chore_completed: 'fas fa-check-circle',
            chore_verified: 'fas fa-medal',
            chore_rejected: 'fas fa-times-circle',
            reward_redeemed: 'fas fa-gift',
            points_earned: 'fas fa-star',
            chore_assigned: 'fas fa-tasks',
            chore_reminder: 'fas fa-clock',
            achievement_unlocked: 'fas fa-trophy'
        };
        return icons[type] || 'fas fa-bell';
    }

    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/notifications/read/${notificationId}`, {
                method: 'POST'
            });
            
            if (response.ok) {
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification) {
                    notification.read = true;
                    this.updateUnreadCount();
                    this.renderNotifications();
                }
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }

    startPolling() {
        setInterval(() => this.loadNotifications(), 30000); // Poll every 30 seconds
    }

    setupEventListeners() {
        document.getElementById('notifications-toggle').addEventListener('click', () => {
            this.container.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target) && 
                !e.target.matches('#notifications-toggle')) {
                this.container.classList.remove('show');
            }
        });
    }
}
