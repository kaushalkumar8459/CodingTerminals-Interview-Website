/**
 * ============================================
 * GLOBAL LOADER UTILITY
 * Reusable loader functions for all pages
 * ============================================
 */

const GlobalLoader = {
    /**
     * Show the global loader
     * @param {string} message - Main message to display
     * @param {string} submessage - Optional secondary message
     */
    show: function(message = 'Loading', submessage = 'Please wait...') {
        const loader = document.getElementById('globalLoader');
        const messageEl = document.getElementById('loaderMessage');
        const submessageEl = document.getElementById('loaderSubmessage');
        
        if (loader) {
            if (messageEl) messageEl.textContent = message;
            if (submessageEl) submessageEl.textContent = submessage;
            loader.classList.add('show');
        }
    },

    /**
     * Hide the global loader
     */
    hide: function() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.classList.remove('show');
        }
    },

    /**
     * Update loader message without hiding
     * @param {string} message - New main message
     * @param {string} submessage - New secondary message
     */
    updateMessage: function(message, submessage = '') {
        const messageEl = document.getElementById('loaderMessage');
        const submessageEl = document.getElementById('loaderSubmessage');
        
        if (messageEl) messageEl.textContent = message;
        if (submessageEl) submessageEl.textContent = submessage;
    },

    /**
     * Show loader for a specific duration
     * @param {number} duration - Duration in milliseconds
     * @param {string} message - Message to display
     */
    showForDuration: function(duration, message = 'Loading') {
        this.show(message);
        setTimeout(() => {
            this.hide();
        }, duration);
    },

    /**
     * Show loader with progress (for long operations)
     * @param {string} message - Message to display
     */
    showWithProgress: function(message = 'Processing') {
        this.show(message);
        const progressBar = document.querySelector('.loader-progress');
        if (progressBar) {
            progressBar.style.display = 'block';
        }
    }
};

// Make it globally available
window.GlobalLoader = GlobalLoader;
