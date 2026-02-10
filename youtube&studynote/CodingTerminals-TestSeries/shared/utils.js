// File: CodingTerminals-TestSeries/shared/utils.js
// Shared utilities module for TestSeries application

/**
 * TestSeriesUtils - Encapsulated utility module
 * Contains common functions used across admin and viewer pages
 */
const TestSeriesUtils = (function() {
    'use strict';

    // ==================== CONFIGURATION ====================
    
    // Quill Editor Toolbar Configurations
    const QUILL_TOOLBARS = {
        full: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['code-block'],
            ['link', 'image'],
            ['clean']
        ],
        minimal: [
            ['bold', 'italic', 'underline'],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            ['code-block'],
            ['clean']
        ]
    };

    // Default values for dropdowns
    const DEFAULTS = {
        subjects: [
            'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
            'English', 'History', 'Geography', 'Economics', 'Accountancy',
            'Business Studies', 'Political Science', 'Psychology', 'Other'
        ],
        years: [
            '2020-2021', '2021-2022', '2022-2023', '2023-2024',
            '2024-2025', '2025-2026', '2026-2027'
        ],
        examTypes: [
            'Board Exam', 'University Exam', 'Competitive Exam',
            'Mid-Term', 'Final Exam', 'Mock Test', 'Practice Paper'
        ],
        difficulties: ['Beginner', 'Intermediate', 'Advanced', 'Expert']
    };

    // ==================== API UTILITIES ====================

    /**
     * Determine the base URL based on environment
     * @returns {string} The base URL for API calls
     */
    function determineBaseUrl() {
        // Check if we have an APP_CONFIG with API_BASE_URL defined
        if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.API && APP_CONFIG.API.BASE_URL) {
            return APP_CONFIG.API.BASE_URL;
        }

        // Determine environment based on current hostname
        const hostname = window.location.hostname;

        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3000';
        } else {
            // Production environment
            return typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.BASE_URL : '';
        }
    }

    /**
     * Get API endpoints configuration
     * @returns {object} API configuration object
     */
    function getApiConfig() {
        const baseUrl = determineBaseUrl();
        const endpoints = typeof APP_CONFIG !== 'undefined' && APP_CONFIG.API ? 
            APP_CONFIG.API.ENDPOINTS : { QUESTIONS: '/api/questions' };
        
        return {
            BASE_URL: baseUrl,
            ENDPOINTS: endpoints,
            URLS: {
                GET_ALL_QUESTIONS: baseUrl + (endpoints.QUESTIONS || '/api/questions'),
                CREATE_QUESTION: baseUrl + (endpoints.QUESTIONS || '/api/questions'),
                UPDATE_QUESTION: (id) => `${baseUrl}${endpoints.QUESTIONS || '/api/questions'}/${id}`,
                DELETE_QUESTION: (id) => `${baseUrl}${endpoints.QUESTIONS || '/api/questions'}/${id}`,
                BULK_CREATE: baseUrl + (endpoints.QUESTIONS || '/api/questions') + '/bulk'
            }
        };
    }

    // ==================== SECURITY UTILITIES ====================

    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} html - The HTML string to sanitize
     * @returns {string} Sanitized HTML string
     */
    function sanitizeHTML(html) {
        if (!html) return '';
        
        // Use DOMPurify if available
        if (typeof DOMPurify !== 'undefined') {
            return DOMPurify.sanitize(html, {
                ALLOWED_TAGS: ['b', 'i', 'u', 's', 'em', 'strong', 'sub', 'sup', 'br', 'p', 'span', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'img'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target']
            });
        }
        
        // Fallback: basic HTML entity encoding
        const div = document.createElement('div');
        div.textContent = html;
        return div.innerHTML;
    }

    /**
     * Escape HTML entities for safe display
     * @param {string} text - The text to escape
     * @returns {string} Escaped text
     */
    function escapeHTML(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== QUILL EDITOR UTILITIES ====================

    /**
     * Destroy a Quill editor instance properly to prevent memory leaks
     * @param {Quill} editor - The Quill editor instance to destroy
     * @returns {null} Returns null for assignment
     */
    function destroyQuillEditor(editor) {
        if (editor && editor.container) {
            // Remove event listeners
            try {
                editor.off('text-change');
                editor.off('selection-change');
            } catch (e) {
                // Ignore errors during cleanup
            }
            // Clear the container
            if (editor.container.parentNode) {
                editor.container.innerHTML = '';
            }
        }
        return null;
    }

    /**
     * Create a new Quill editor instance
     * @param {string|HTMLElement} container - The container element or selector
     * @param {object} options - Quill options (optional)
     * @param {string} toolbarType - 'full' or 'minimal' (default: 'full')
     * @returns {Quill|null} The Quill instance or null if creation failed
     */
    function createQuillEditor(container, options = {}, toolbarType = 'full') {
        if (typeof Quill === 'undefined') {
            console.error('Quill is not loaded');
            return null;
        }

        const defaultOptions = {
            theme: 'snow',
            modules: {
                toolbar: QUILL_TOOLBARS[toolbarType] || QUILL_TOOLBARS.full
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };
        
        try {
            return new Quill(container, mergedOptions);
        } catch (e) {
            console.error('Failed to create Quill editor:', e);
            return null;
        }
    }

    /**
     * Get HTML content from a Quill editor safely
     * @param {Quill} editor - The Quill editor instance
     * @returns {string} The HTML content or empty string
     */
    function getQuillHTML(editor) {
        if (!editor || !editor.root) return '';
        const html = editor.root.innerHTML;
        return html === '<p><br></p>' ? '' : html;
    }

    // ==================== UI UTILITIES ====================

    /**
     * Show a toast notification
     * @param {string} message - The message to display
     * @param {string} type - The type: 'success', 'error', 'warning', 'info' (default: 'info')
     * @param {number} duration - Duration in milliseconds (default: 3000)
     */
    function showToast(message, type = 'info', duration = 3000) {
        let toastContainer = document.getElementById('toastContainer');

        // Create toast container if it doesn't exist
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        
        // Color mapping
        const colorClasses = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        toast.className = `p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full ${colorClasses[type] || colorClasses.info}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full');
        });

        // Remove after duration
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    /**
     * Show a styled confirmation dialog
     * @param {string} message - The confirmation message
     * @param {string} title - The dialog title (optional)
     * @param {object} options - Additional options (confirmText, cancelText, type)
     * @returns {Promise<boolean>} Resolves to true if confirmed, false otherwise
     */
    function showConfirmDialog(message, title = 'Confirm', options = {}) {
        return new Promise((resolve) => {
            const {
                confirmText = 'Confirm',
                cancelText = 'Cancel',
                type = 'warning' // 'warning', 'danger', 'info'
            } = options;

            // Remove any existing confirm modal
            const existing = document.getElementById('confirmDialogOverlay');
            if (existing) existing.remove();

            // Color mapping for button styles
            const buttonColors = {
                warning: 'bg-yellow-500 hover:bg-yellow-600',
                danger: 'bg-red-500 hover:bg-red-600',
                info: 'bg-blue-500 hover:bg-blue-600'
            };

            const iconColors = {
                warning: 'text-yellow-500',
                danger: 'text-red-500',
                info: 'text-blue-500'
            };

            const icons = {
                warning: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>',
                danger: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>',
                info: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>'
            };

            const overlay = document.createElement('div');
            overlay.id = 'confirmDialogOverlay';
            overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] animate-fadeIn';
            overlay.innerHTML = `
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all animate-scaleIn">
                    <div class="p-6">
                        <div class="flex items-center mb-4">
                            <div class="flex-shrink-0 ${iconColors[type]}">
                                <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    ${icons[type]}
                                </svg>
                            </div>
                            <h3 class="ml-3 text-lg font-semibold text-gray-900">${escapeHTML(title)}</h3>
                        </div>
                        <p class="text-gray-600 mb-6">${escapeHTML(message)}</p>
                        <div class="flex justify-end space-x-3">
                            <button id="confirmDialogCancel" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                                ${escapeHTML(cancelText)}
                            </button>
                            <button id="confirmDialogConfirm" class="${buttonColors[type]} px-4 py-2 text-white rounded-lg transition-colors">
                                ${escapeHTML(confirmText)}
                            </button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            // Handle confirm
            document.getElementById('confirmDialogConfirm').onclick = () => {
                overlay.remove();
                resolve(true);
            };

            // Handle cancel
            document.getElementById('confirmDialogCancel').onclick = () => {
                overlay.remove();
                resolve(false);
            };

            // Handle escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    overlay.remove();
                    document.removeEventListener('keydown', handleEscape);
                    resolve(false);
                }
            };
            document.addEventListener('keydown', handleEscape);

            // Handle click outside
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve(false);
                }
            });
        });
    }

    /**
     * Show a loading spinner overlay
     * @param {boolean} show - Whether to show or hide the spinner
     * @param {string} message - Optional message to display
     */
    function showLoading(show = true, message = 'Loading...') {
        let loadingOverlay = document.getElementById('loadingOverlay');

        if (show) {
            if (!loadingOverlay) {
                loadingOverlay = document.createElement('div');
                loadingOverlay.id = 'loadingOverlay';
                loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[55]';
                loadingOverlay.innerHTML = `
                    <div class="bg-white rounded-lg p-8 flex flex-col items-center shadow-xl">
                        <div class="relative">
                            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                            <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
                        </div>
                        <p class="text-gray-700 font-medium mt-4" id="loadingMessage">${escapeHTML(message)}</p>
                    </div>
                `;
                document.body.appendChild(loadingOverlay);
            } else {
                const msgEl = loadingOverlay.querySelector('#loadingMessage');
                if (msgEl) msgEl.textContent = message;
                loadingOverlay.style.display = 'flex';
                loadingOverlay.classList.remove('hidden');
            }
        } else if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }

    // ==================== FORM PERSISTENCE ====================

    /**
     * Save form data to localStorage
     * @param {string} key - The storage key
     * @param {object} data - The data to save
     */
    function saveFormData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save form data:', e);
        }
    }

    /**
     * Load form data from localStorage
     * @param {string} key - The storage key
     * @returns {object|null} The saved data or null
     */
    function loadFormData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('Failed to load form data:', e);
            return null;
        }
    }

    /**
     * Clear form data from localStorage
     * @param {string} key - The storage key
     */
    function clearFormData(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to clear form data:', e);
        }
    }

    // ==================== SESSION PERSISTENCE ====================

    /**
     * Save session data
     * @param {string} key - The storage key
     * @param {object} data - The data to save
     */
    function saveSessionData(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save session data:', e);
        }
    }

    /**
     * Load session data
     * @param {string} key - The storage key
     * @returns {object|null} The saved data or null
     */
    function loadSessionData(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.warn('Failed to load session data:', e);
            return null;
        }
    }

    /**
     * Clear session data
     * @param {string} key - The storage key
     */
    function clearSessionData(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to clear session data:', e);
        }
    }

    // ==================== PAGINATION ====================

    /**
     * Create pagination controls
     * @param {object} options - Pagination options
     * @returns {object} Pagination controller
     */
    function createPagination(options = {}) {
        const {
            totalItems = 0,
            itemsPerPage = 10,
            currentPage = 1,
            onPageChange = () => {},
            containerId = 'paginationContainer'
        } = options;

        let state = {
            totalItems,
            itemsPerPage,
            currentPage,
            totalPages: Math.ceil(totalItems / itemsPerPage)
        };

        function getPagedItems(allItems) {
            const start = (state.currentPage - 1) * state.itemsPerPage;
            const end = start + state.itemsPerPage;
            return allItems.slice(start, end);
        }

        function render() {
            const container = document.getElementById(containerId);
            if (!container) return;

            if (state.totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            const { currentPage, totalPages } = state;
            let buttons = [];

            // Previous button
            buttons.push(`
                <button class="pagination-btn px-3 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border"
                    ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                </button>
            `);

            // Page numbers
            const maxVisible = 5;
            let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
            let endPage = Math.min(totalPages, startPage + maxVisible - 1);
            
            if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
            }

            if (startPage > 1) {
                buttons.push(`<button class="pagination-btn px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border" data-page="1">1</button>`);
                if (startPage > 2) {
                    buttons.push(`<span class="px-2 py-2 text-gray-500">...</span>`);
                }
            }

            for (let i = startPage; i <= endPage; i++) {
                const isActive = i === currentPage;
                buttons.push(`
                    <button class="pagination-btn px-3 py-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'} border"
                        data-page="${i}">${i}</button>
                `);
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    buttons.push(`<span class="px-2 py-2 text-gray-500">...</span>`);
                }
                buttons.push(`<button class="pagination-btn px-3 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-100 border" data-page="${totalPages}">${totalPages}</button>`);
            }

            // Next button
            buttons.push(`
                <button class="pagination-btn px-3 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'} border"
                    ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            `);

            container.innerHTML = `
                <div class="flex items-center justify-between mt-4">
                    <p class="text-sm text-gray-600">
                        Showing ${((currentPage - 1) * state.itemsPerPage) + 1} to ${Math.min(currentPage * state.itemsPerPage, state.totalItems)} of ${state.totalItems}
                    </p>
                    <div class="flex items-center space-x-1">
                        ${buttons.join('')}
                    </div>
                </div>
            `;

            // Add click handlers
            container.querySelectorAll('.pagination-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const page = parseInt(btn.dataset.page);
                    if (page && page !== state.currentPage && page >= 1 && page <= state.totalPages) {
                        state.currentPage = page;
                        render();
                        onPageChange(state.currentPage, state);
                    }
                });
            });
        }

        function update(newOptions) {
            if (newOptions.totalItems !== undefined) {
                state.totalItems = newOptions.totalItems;
                state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
            }
            if (newOptions.itemsPerPage !== undefined) {
                state.itemsPerPage = newOptions.itemsPerPage;
                state.totalPages = Math.ceil(state.totalItems / state.itemsPerPage);
            }
            if (newOptions.currentPage !== undefined) {
                state.currentPage = Math.min(Math.max(1, newOptions.currentPage), state.totalPages || 1);
            }
            render();
        }

        function reset() {
            state.currentPage = 1;
            render();
        }

        return {
            render,
            update,
            reset,
            getPagedItems,
            getState: () => ({ ...state })
        };
    }

    // ==================== FORM UTILITIES ====================

    /**
     * Setup a search/autocomplete field with suggestions
     * @param {string} inputId - The input element ID
     * @param {string} suggestionsId - The suggestions container ID
     * @param {Set|Array} dataSource - The data source for suggestions
     * @param {string} placeholder - Placeholder text (optional)
     */
    function setupSearchField(inputId, suggestionsId, dataSource, placeholder = '') {
        const inputElement = document.getElementById(inputId);
        const suggestionsContainer = document.getElementById(suggestionsId);

        if (!inputElement || !suggestionsContainer) {
            return;
        }

        if (placeholder) {
            inputElement.placeholder = placeholder;
        }

        // Convert Set to Array if needed
        const getDataArray = () => Array.isArray(dataSource) ? dataSource : Array.from(dataSource);

        // Input event - show suggestions as user types
        inputElement.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            showFilteredSuggestions(query, getDataArray(), suggestionsContainer, inputElement);
        });

        // Focus event - show all suggestions when field gains focus
        inputElement.addEventListener('focus', function () {
            const query = this.value ? this.value.toLowerCase() : '';
            showFilteredSuggestions(query, getDataArray(), suggestionsContainer, inputElement);
        });

        // Click outside - hide suggestions
        document.addEventListener('click', function (event) {
            if (!event.target.closest(`#${inputId}`) && !event.target.closest(`#${suggestionsId}`)) {
                suggestionsContainer.classList.add('hidden');
            }
        });
    }

    /**
     * Show filtered suggestions in a container
     * @param {string} query - The search query
     * @param {Array} dataArray - The data array to filter
     * @param {HTMLElement} container - The suggestions container
     * @param {HTMLElement} inputElement - The input element
     */
    function showFilteredSuggestions(query, dataArray, container, inputElement) {
        container.innerHTML = '';

        const filtered = dataArray.filter(item => 
            item && item.toString().toLowerCase().includes(query)
        );

        if (filtered.length > 0) {
            filtered.slice(0, 10).forEach(item => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'px-4 py-2 cursor-pointer hover:bg-blue-100';
                suggestionItem.textContent = item;
                suggestionItem.onclick = function () {
                    inputElement.value = item;
                    container.classList.add('hidden');
                };
                container.appendChild(suggestionItem);
            });
            container.classList.remove('hidden');
        } else if (query.trim() !== '') {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-4 py-2 cursor-pointer hover:bg-blue-100 text-blue-600';
            suggestionItem.textContent = `Add "${query}" as new value`;
            suggestionItem.onclick = function () {
                inputElement.value = query;
                container.classList.add('hidden');
            };
            container.appendChild(suggestionItem);
            container.classList.remove('hidden');
        } else {
            container.classList.add('hidden');
        }
    }

    /**
     * Debounce a function call
     * @param {Function} func - The function to debounce
     * @param {number} wait - The debounce delay in milliseconds
     * @returns {Function} The debounced function
     */
    function debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // ==================== DATA UTILITIES ====================

    /**
     * Load existing values from the database for dropdowns
     * @param {string} apiUrl - The API URL to fetch questions
     * @returns {Promise<object>} Object containing Sets for subjects, years, examTypes, difficulties
     */
    async function loadExistingValues(apiUrl) {
        const result = {
            subjects: new Set(DEFAULTS.subjects),
            years: new Set(DEFAULTS.years),
            examTypes: new Set(DEFAULTS.examTypes),
            difficulties: new Set(DEFAULTS.difficulties)
        };

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.data) {
                data.data.forEach(question => {
                    if (question.subject) result.subjects.add(question.subject);
                    if (question.academicYear) result.years.add(question.academicYear.toString());
                    if (question.examType) result.examTypes.add(question.examType);
                    if (question.difficulty) result.difficulties.add(question.difficulty);
                });
            }
        } catch (error) {
            console.error('Error loading existing values:', error);
            // Defaults are already set, so we just log the error
        }

        return result;
    }

    /**
     * Populate a select dropdown with options
     * @param {string|HTMLElement} selectElement - The select element or ID
     * @param {Set|Array} options - The options to populate
     * @param {string} defaultOption - The default/all option text (optional)
     * @param {string} defaultValue - The default option value (optional, default: 'all')
     */
    function populateSelect(selectElement, options, defaultOption = null, defaultValue = 'all') {
        const select = typeof selectElement === 'string' ? 
            document.getElementById(selectElement) : selectElement;
        
        if (!select) return;

        select.innerHTML = '';

        if (defaultOption) {
            const defaultOpt = document.createElement('option');
            defaultOpt.value = defaultValue;
            defaultOpt.textContent = defaultOption;
            select.appendChild(defaultOpt);
        }

        const optionsArray = Array.isArray(options) ? options : Array.from(options);
        optionsArray.sort().forEach(item => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
    }

    // ==================== AUTHENTICATION ====================

    /**
     * Logout the current user
     * @param {string} redirectUrl - The URL to redirect to after logout (default: login page)
     */
    async function logout(redirectUrl = '../../auth/login.html') {
        const confirmed = await showConfirmDialog(
            'Are you sure you want to logout?',
            'Logout',
            { confirmText: 'Logout', cancelText: 'Cancel', type: 'warning' }
        );
        if (confirmed) {
            sessionStorage.clear();
            localStorage.removeItem('authToken');
            window.location.href = redirectUrl;
        }
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize toast animation styles
     */
    function initToastStyles() {
        if (document.querySelector('#toast-animation-styles')) return;

        const style = document.createElement('style');
        style.id = 'toast-animation-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .toast-enter { animation: slideInRight 0.3s ease-out forwards; }
            .toast-exit { animation: slideOutRight 0.3s ease-in forwards; }
            .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
            .animate-scaleIn { animation: scaleIn 0.2s ease-out forwards; }
        `;
        document.head.appendChild(style);
    }

    // Initialize styles on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToastStyles);
    } else {
        initToastStyles();
    }

    // ==================== PUBLIC API ====================
    return {
        // Configuration
        QUILL_TOOLBARS,
        DEFAULTS,
        
        // API utilities
        determineBaseUrl,
        getApiConfig,
        
        // Security
        sanitizeHTML,
        escapeHTML,
        
        // Quill utilities
        destroyQuillEditor,
        createQuillEditor,
        getQuillHTML,
        
        // UI utilities
        showToast,
        showConfirmDialog,
        showLoading,
        createPagination,
        
        // Form utilities
        setupSearchField,
        debounce,
        
        // Data utilities
        loadExistingValues,
        populateSelect,
        
        // Persistence utilities
        saveFormData,
        loadFormData,
        clearFormData,
        saveSessionData,
        loadSessionData,
        clearSessionData,
        
        // Authentication
        logout
    };
})();

// Export for ES6 modules (if supported)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestSeriesUtils;
}

// Also expose individual functions globally for backward compatibility
// This allows existing code to work without modification
const {
    sanitizeHTML,
    escapeHTML,
    destroyQuillEditor,
    createQuillEditor,
    getQuillHTML,
    showToast,
    showConfirmDialog,
    showLoading,
    createPagination,
    debounce,
    populateSelect,
    saveFormData,
    loadFormData,
    clearFormData,
    saveSessionData,
    loadSessionData,
    clearSessionData
} = TestSeriesUtils;

// Expose toolbar configs globally for backward compatibility
const fullToolbarOptions = TestSeriesUtils.QUILL_TOOLBARS.full;
const minimalToolbarOptions = TestSeriesUtils.QUILL_TOOLBARS.minimal;
