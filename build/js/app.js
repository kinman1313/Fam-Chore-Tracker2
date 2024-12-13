// Core application functionality
const app = {
    // State management
    state: {
        darkMode: true,
        isAuthenticated: false
    },

    // Authentication methods
    auth: {
        login: async (credentials) => {
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(credentials)
                });
                const data = await response.json();
                if (response.ok) {
                    app.state.isAuthenticated = true;
                    localStorage.setItem('token', data.token);
                    return { success: true };
                }
                return { success: false, message: data.message };
            } catch (error) {
                console.error('Login error:', error);
                return { success: false, message: 'Login failed' };
            }
        },

        logout: () => {
            localStorage.removeItem('token');
            app.state.isAuthenticated = false;
            window.location.href = '/login';
        }
    },

    // UI methods
    ui: {
        showAlert: (message, type = 'error') => {
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert alert-${type}`;
            alertDiv.textContent = message;
            
            const container = document.querySelector('.container');
            container.insertBefore(alertDiv, container.firstChild);

            setTimeout(() => alertDiv.remove(), 3000);
        },

        toggleDarkMode: () => {
            document.body.classList.toggle('dark-mode');
            app.state.darkMode = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', app.state.darkMode);
        }
    },

    // API utilities
    api: {
        get: async (endpoint) => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        },

        post: async (endpoint, data) => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });
                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        }
    }
};
