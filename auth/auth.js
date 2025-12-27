// ==================== AUTHENTICATION UTILITIES ====================
/**
 * Centralized authentication utilities for Coding Terminals Admin System
 * This module provides reusable authentication functions for all admin sections
 */

const AuthUtils = {
    // Session storage keys
    KEYS: {
        AUTH: 'adminAuth',
        USER: 'adminUser',
        LOGIN_TIME: 'loginTime',
        REDIRECT: 'authRedirect'
    },

    /**
     * Set authentication session
     * @param {string} username - The authenticated username
     */
    setAuthentication(username) {
        sessionStorage.setItem(this.KEYS.AUTH, 'true');
        sessionStorage.setItem(this.KEYS.USER, username);
        sessionStorage.setItem(this.KEYS.LOGIN_TIME, new Date().getTime());
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated() {
        const auth = sessionStorage.getItem(this.KEYS.AUTH);
        const loginTime = sessionStorage.getItem(this.KEYS.LOGIN_TIME);
        
        // Check if authenticated
        if (auth !== 'true') {
            return false;
        }
        
        // Check session expiry (optional - 24 hours)
        if (loginTime) {
            const now = new Date().getTime();
            const elapsed = now - parseInt(loginTime);
            const hours = elapsed / (1000 * 60 * 60);
            
            if (hours > 24) {
                this.logout();
                return false;
            }
        }
        
        return true;
    },

    /**
     * Get authenticated username
     * @returns {string|null} Username or null if not authenticated
     */
    getUsername() {
        return sessionStorage.getItem(this.KEYS.USER);
    },

    /**
     * Get login time
     * @returns {Date|null} Login time or null
     */
    getLoginTime() {
        const loginTime = sessionStorage.getItem(this.KEYS.LOGIN_TIME);
        return loginTime ? new Date(parseInt(loginTime)) : null;
    },

    /**
     * Logout and clear session
     */
    logout() {
        sessionStorage.removeItem(this.KEYS.AUTH);
        sessionStorage.removeItem(this.KEYS.USER);
        sessionStorage.removeItem(this.KEYS.LOGIN_TIME);
    },

    /**
     * Require authentication - redirect to login if not authenticated
     * @param {string} redirectBackTo - The URL to redirect back to after login
     */
    requireAuth(redirectBackTo = null) {
        if (!this.isAuthenticated()) {
            // Store the current page URL for redirect after login
            if (redirectBackTo) {
                sessionStorage.setItem(this.KEYS.REDIRECT, redirectBackTo);
            }
            
            // Build login URL with redirect parameter
            const loginUrl = redirectBackTo 
                ? `../auth/login.html?redirect=${encodeURIComponent(redirectBackTo)}`
                : '../auth/login.html';
            
            window.location.href = loginUrl;
            return false;
        }
        return true;
    },

    /**
     * Get session duration in minutes
     * @returns {number} Minutes since login
     */
    getSessionDuration() {
        const loginTime = this.getLoginTime();
        if (!loginTime) return 0;
        
        const now = new Date();
        const diff = now - loginTime;
        return Math.floor(diff / (1000 * 60));
    },

    /**
     * Display user info in header
     * @param {string} elementId - The ID of the element to display user info
     */
    displayUserInfo(elementId = 'userInfo') {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const username = this.getUsername();
        const duration = this.getSessionDuration();
        
        element.innerHTML = `
            <div class="user-info">
                <span class="user-icon">👤</span>
                <span class="username">${username}</span>
                <span class="session-time">(${duration} min)</span>
            </div>
        `;
    },

    /**
     * Confirm logout with user
     * @param {Function} onConfirm - Callback after logout confirmation
     */
    confirmLogout(onConfirm = null) {
        if (confirm('Are you sure you want to logout?')) {
            this.logout();
            if (onConfirm) {
                onConfirm();
            } else {
                window.location.href = '../auth/login.html';
            }
        }
    }
};

// ==================== GLOBAL LOGOUT FUNCTION ====================
/**
 * Global logout function that can be called from any admin page
 */
function logout() {
    AuthUtils.confirmLogout();
}

// ==================== AUTO SESSION EXPIRY CHECK ====================
// Check session expiry every 5 minutes
setInterval(() => {
    if (!AuthUtils.isAuthenticated()) {
        alert('Your session has expired. Please login again.');
        window.location.href = '../auth/login.html';
    }
}, 5 * 60 * 1000); // 5 minutes
