// Initialize application and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        document.body.classList.add('dark-mode');
    }

    // Set up authentication check
    const token = localStorage.getItem('token');
    if (token) {
        app.state.isAuthenticated = true;
    }

    // Event Listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Dark mode toggle
    const darkModeToggle = document.querySelector('#darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', app.ui.toggleDarkMode);
    }

    // Login form
    const loginForm = document.querySelector('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const credentials = {
                email: loginForm.email.value,
                password: loginForm.password.value
            };
            const result = await app.auth.login(credentials);
            if (result.success) {
                window.location.href = '/dashboard';
            } else {
                app.ui.showAlert(result.message);
            }
        });
    }

    // Logout button
    const logoutBtn = document.querySelector('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            app.auth.logout();
        });
    }

    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!form.checkValidity()) {
                e.preventDefault();
                e.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });
}

// Handle loading states
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Handle network status
window.addEventListener('online', () => {
    app.ui.showAlert('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    app.ui.showAlert('No internet connection', 'error');
});
