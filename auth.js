class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.googleAuth = null;
        this.init();
        
        // Add debug logging
        console.log('AuthSystem initialized');
    }

    init() {
        // Ensure DOM is loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeSystem());
        } else {
            this.initializeSystem();
        }
    }

    initializeSystem() {
        console.log('Initializing AuthSystem...');
        
        // Load Google Sign-In API
        this.loadGoogleSignIn();
        
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (token) {
            this.validateToken(token);
        }
        this.setupEventListeners();
        this.updateUIState();
    }

    loadGoogleSignIn() {
        console.log('Loading Google Sign-In...');
        
        // Check if Google API is already loaded
        if (typeof google !== 'undefined' && google.accounts) {
            this.initializeGoogleSignIn();
        } else {
            // Wait for Google API to load
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (typeof google !== 'undefined' && google.accounts) {
                        this.initializeGoogleSignIn();
                    } else {
                        console.error('Google Identity Services failed to load');
                    }
                }, 1000); // Give extra time for Google API to initialize
            });
        }
    }

    initializeGoogleSignIn() {
        console.log('Initializing Google Sign-In...');
        
        // Determine if we're in local development or production
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';

        google.accounts.id.initialize({
            client_id: '438519504218-4fdagbgbgouqtcpjdng2bofdp68270bh.apps.googleusercontent.com',
            callback: this.handleGoogleSignIn.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
            ux_mode: 'popup'  // Changed from 'redirect' to 'popup' for easier local testing
        });

        const googleBtn = document.getElementById('googleLogin');
        if (googleBtn) {
            console.log('Rendering Google Sign-In button...');
            google.accounts.id.renderButton(googleBtn, {
                type: 'standard',
                theme: document.body.classList.contains('dark-mode') ? 'filled_black' : 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: '100%'
            });
        } else {
            console.error('Google Sign-In button container not found');
        }
    }

    async handleGoogleSignIn(response) {
        const notifications = new NotificationSystem();
        
        try {
            console.log('Google Sign-In response received:', response);
            
            // Decode the JWT token to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            console.log('Decoded user info:', payload);

            // Use the actual Google user info instead of mock data
            const result = {
                success: true,
                token: response.credential, // Store the actual Google token
                user: {
                    name: payload.name,
                    email: payload.email,
                    avatar: payload.picture
                }
            };

            // Store user info
            localStorage.setItem('authToken', result.token);
            localStorage.setItem('userInfo', JSON.stringify(result.user));
            this.currentUser = result.user;
            this.updateUIState();

            // Show success message
            notifications.push('Successfully signed in with Google!', 'success');
            
            // Handle redirect
            setTimeout(() => {
                const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'enrollment.html';
                window.location.href = redirectUrl;
            }, 1000);

        } catch (error) {
            console.error('Google Sign-In error:', error);
            notifications.push('Failed to sign in with Google. Please try again.', 'error');
        }
    }

    async verifyGoogleToken(token) {
        // In a real application, send this token to your backend for verification
        // For demo purposes, we'll simulate a successful response
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'mock-jwt-token',
                    user: {
                        name: 'Google User',
                        email: 'user@gmail.com',
                        avatar: 'https://lh3.googleusercontent.com/...'
                    }
                });
            }, 1000);
        });
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const logoutBtn = document.querySelector('.logout-btn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegistration(e));
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Add profile dropdown toggle
        const profileToggle = document.querySelector('.profile-toggle');
        if (profileToggle) {
            profileToggle.addEventListener('click', () => {
                profileToggle.classList.toggle('active');
                document.querySelector('.profile-dropdown').classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.user-profile')) {
                    profileToggle.classList.remove('active');
                    document.querySelector('.profile-dropdown').classList.remove('active');
                }
            });
        }
    }

    updateUIState() {
        const userInfo = this.currentUser || JSON.parse(localStorage.getItem('userInfo'));
        const token = localStorage.getItem('authToken');
        const authButtons = document.querySelector('.auth-buttons');
        const userProfile = document.querySelector('.user-profile');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (token && userInfo) {
            if (authButtons) authButtons.style.display = 'none';
            if (userProfile) {
                userProfile.style.display = 'flex';
                if (userAvatar) userAvatar.src = userInfo.avatar || 'images/default-avatar.png';
                if (userName) userName.textContent = userInfo.name;
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userProfile) userProfile.style.display = 'none';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await this.loginUser(email, password);
            if (response.success) {
                localStorage.setItem('authToken', response.token);
                this.currentUser = response.user;
                this.updateUIState();
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            const notifications = new NotificationSystem();
            notifications.push('Invalid email or password', 'error');
        }
    }

    async handleRegistration(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData.entries());

        try {
            const response = await this.registerUser(userData);
            if (response.success) {
                const notifications = new NotificationSystem();
                notifications.push('Registration successful! Please log in.', 'success');
                window.location.href = 'login.html';
            }
        } catch (error) {
            const notifications = new NotificationSystem();
            notifications.push(error.message, 'error');
        }
    }

    handleLogout() {
        localStorage.removeItem('authToken');
        this.currentUser = null;
        this.updateUIState();
        window.location.href = 'index.html';
    }

    // Mock API calls (replace with actual API endpoints)
    async loginUser(email, password) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    token: 'mock-jwt-token',
                    user: { email, name: 'Test User' }
                });
            }, 1000);
        });
    }

    async registerUser(userData) {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Registration successful'
                });
            }, 1000);
        });
    }

    validateToken(token) {
        // Implement token validation logic
    }
}

// Initialize AuthSystem
const authSystem = new AuthSystem(); 