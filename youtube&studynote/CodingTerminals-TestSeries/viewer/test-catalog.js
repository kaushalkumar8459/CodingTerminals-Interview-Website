// File: CodingTerminals-TestSeries/viewer/test-catalog.js
// Test Catalog - Browse and select tests
// Note: Common utilities (sanitizeHTML, showToast, etc.) are loaded from shared/utils.js

// API Configuration
const API_BASE_URL = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.API?.BASE_URL) 
    ? APP_CONFIG.API.BASE_URL 
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:3000'
        : window.location.origin;

// Global Variables
let allTests = [];
let filteredTests = [];
let selectedTest = null;
let currentPage = 1;
const TESTS_PER_PAGE = 9;

// Filter state
let filters = {
    search: '',
    subject: 'all',
    year: 'all',
    difficulty: 'all',
    sort: 'newest',
    quickFilter: 'all'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Initialize application
async function initializeApp() {
    setupEventListeners();
    await loadTests();
    populateFilterDropdowns();
}

// Setup event listeners
function setupEventListeners() {
    // Search input with debounce
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            filters.search = e.target.value.toLowerCase();
            applyFilters();
        }, 300);
    });

    // Filter dropdowns
    document.getElementById('subjectFilter').addEventListener('change', (e) => {
        filters.subject = e.target.value;
        applyFilters();
    });

    document.getElementById('yearFilter').addEventListener('change', (e) => {
        filters.year = e.target.value;
        applyFilters();
    });

    document.getElementById('difficultyFilter').addEventListener('change', (e) => {
        filters.difficulty = e.target.value;
        applyFilters();
    });

    document.getElementById('sortBy').addEventListener('change', (e) => {
        filters.sort = e.target.value;
        applyFilters();
    });
}

// Load tests from API
async function loadTests() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/tests?isPublished=true&isActive=true`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            allTests = result.data || [];
            filteredTests = [...allTests];
            
            // Update stats
            updateStats();
            
            // Render tests
            renderTests();
        } else {
            throw new Error(result.error || 'Failed to load tests');
        }
    } catch (error) {
        console.error('Error loading tests:', error);
        showToast('Failed to load tests. Please try again.', 'error');
        renderEmptyState();
    }
}

// Update statistics
function updateStats() {
    document.getElementById('totalTestsCount').textContent = allTests.length;
    
    const totalQuestions = allTests.reduce((sum, test) => sum + (test.totalQuestions || test.questions?.length || 0), 0);
    document.getElementById('totalQuestionsCount').textContent = totalQuestions;
}

// Populate filter dropdowns from data
function populateFilterDropdowns() {
    const subjects = new Set();
    const years = new Set();

    allTests.forEach(test => {
        if (test.subject) subjects.add(test.subject);
        if (test.academicYear) years.add(test.academicYear);
    });

    // Populate subjects
    const subjectSelect = document.getElementById('subjectFilter');
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
    });

    // Populate years
    const yearSelect = document.getElementById('yearFilter');
    Array.from(years).sort().reverse().forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    filteredTests = allTests.filter(test => {
        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            const matchesTitle = test.title?.toLowerCase().includes(searchTerm);
            const matchesSubject = test.subject?.toLowerCase().includes(searchTerm);
            const matchesDescription = test.description?.toLowerCase().includes(searchTerm);
            if (!matchesTitle && !matchesSubject && !matchesDescription) {
                return false;
            }
        }

        // Subject filter
        if (filters.subject !== 'all' && test.subject !== filters.subject) {
            return false;
        }

        // Year filter
        if (filters.year !== 'all' && test.academicYear !== filters.year) {
            return false;
        }

        // Difficulty filter - check difficultyDistribution or default
        if (filters.difficulty !== 'all') {
            // Simple check - could be enhanced based on actual data structure
            const hasDifficulty = test.difficultyDistribution && 
                test.difficultyDistribution[filters.difficulty.toLowerCase()] > 0;
            if (!hasDifficulty && test.difficulty !== filters.difficulty) {
                return false;
            }
        }

        // Quick filters
        if (filters.quickFilter !== 'all') {
            const questionsCount = test.totalQuestions || test.questions?.length || 0;
            
            switch (filters.quickFilter) {
                case 'recent':
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    if (new Date(test.createdAt) < oneWeekAgo) return false;
                    break;
                case 'short':
                    if (questionsCount > 20) return false;
                    break;
                case 'long':
                    if (questionsCount < 50) return false;
                    break;
                case 'popular':
                    // Could be based on attempt count if available
                    break;
            }
        }

        return true;
    });

    // Apply sorting
    sortTests();

    // Reset to first page
    currentPage = 1;

    // Render
    renderTests();
}

// Sort tests
function sortTests() {
    filteredTests.sort((a, b) => {
        switch (filters.sort) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'questions-high':
                return (b.totalQuestions || 0) - (a.totalQuestions || 0);
            case 'questions-low':
                return (a.totalQuestions || 0) - (b.totalQuestions || 0);
            case 'duration-high':
                return (b.duration || 0) - (a.duration || 0);
            case 'duration-low':
                return (a.duration || 0) - (b.duration || 0);
            default:
                return 0;
        }
    });
}

// Set quick filter
function setQuickFilter(filter) {
    filters.quickFilter = filter;

    // Update chip styles
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.filter === filter) {
            chip.classList.add('active');
        }
    });

    applyFilters();
}

// Clear all filters
function clearFilters() {
    filters = {
        search: '',
        subject: 'all',
        year: 'all',
        difficulty: 'all',
        sort: 'newest',
        quickFilter: 'all'
    };

    // Reset UI
    document.getElementById('searchInput').value = '';
    document.getElementById('subjectFilter').value = 'all';
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('difficultyFilter').value = 'all';
    document.getElementById('sortBy').value = 'newest';

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.remove('active');
        if (chip.dataset.filter === 'all') {
            chip.classList.add('active');
        }
    });

    applyFilters();
}

// Render tests grid
function renderTests() {
    const container = document.getElementById('testsContainer');
    const emptyState = document.getElementById('emptyState');

    // Remove skeleton loaders
    container.querySelectorAll('.skeleton-card').forEach(el => el.remove());

    if (filteredTests.length === 0) {
        container.innerHTML = '';
        emptyState.classList.remove('hidden');
        document.getElementById('paginationContainer').innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');

    // Paginate
    const startIndex = (currentPage - 1) * TESTS_PER_PAGE;
    const endIndex = startIndex + TESTS_PER_PAGE;
    const pageTests = filteredTests.slice(startIndex, endIndex);

    container.innerHTML = pageTests.map(test => renderTestCard(test)).join('');

    // Render pagination
    renderPagination();
}

// Render single test card
function renderTestCard(test) {
    const questionsCount = test.totalQuestions || test.questions?.length || 0;
    const duration = test.duration || 60;
    const difficulty = getDominantDifficulty(test);
    const createdDate = test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A';

    return `
        <div class="test-card cursor-pointer" onclick="openTestDetails('${test._id}')">
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-lg font-bold text-gray-800 line-clamp-2">${sanitizeHTML(test.title || 'Untitled Test')}</h3>
                <span class="difficulty-badge difficulty-${difficulty.toLowerCase()}">${difficulty}</span>
            </div>

            <p class="text-sm text-gray-600 mb-4 line-clamp-2">${sanitizeHTML(test.description || 'No description available')}</p>

            <div class="flex flex-wrap gap-2 mb-4">
                <span class="subject-tag">${sanitizeHTML(test.subject || 'General')}</span>
                <span class="subject-tag">${sanitizeHTML(test.academicYear || 'N/A')}</span>
            </div>

            <div class="grid grid-cols-3 gap-4 mb-4 text-center">
                <div class="bg-blue-50 rounded-lg p-2">
                    <div class="text-lg font-bold text-blue-600">${questionsCount}</div>
                    <div class="text-xs text-gray-500">Questions</div>
                </div>
                <div class="bg-green-50 rounded-lg p-2">
                    <div class="text-lg font-bold text-green-600">${duration}</div>
                    <div class="text-xs text-gray-500">Minutes</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-2">
                    <div class="text-lg font-bold text-purple-600">${questionsCount}</div>
                    <div class="text-xs text-gray-500">Marks</div>
                </div>
            </div>

            <div class="flex justify-between items-center text-xs text-gray-400">
                <span>📅 ${createdDate}</span>
                <span>👤 ${test.createdBy?.username || 'Admin'}</span>
            </div>

            <button onclick="event.stopPropagation(); startTestDirect('${test._id}')"
                class="w-full mt-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                🚀 Start Test
            </button>
        </div>
    `;
}

// Get dominant difficulty from distribution
function getDominantDifficulty(test) {
    if (test.difficulty) return test.difficulty;
    
    if (test.difficultyDistribution) {
        const dist = test.difficultyDistribution;
        let max = 0;
        let dominant = 'Intermediate';
        
        for (const [key, value] of Object.entries(dist)) {
            if (value > max) {
                max = value;
                dominant = key.charAt(0).toUpperCase() + key.slice(1);
            }
        }
        return dominant;
    }
    
    return 'Intermediate';
}

// Render pagination
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    const totalPages = Math.ceil(filteredTests.length / TESTS_PER_PAGE);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '';

    // Previous button
    html += `
        <button onclick="goToPage(${currentPage - 1})" 
            class="px-4 py-2 rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50'} border"
            ${currentPage === 1 ? 'disabled' : ''}>
            ← Prev
        </button>
    `;

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        html += `<button onclick="goToPage(1)" class="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-blue-50 border">1</button>`;
        if (startPage > 2) {
            html += `<span class="px-2 text-gray-400">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `
            <button onclick="goToPage(${i})" 
                class="px-4 py-2 rounded-lg ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-blue-50'} border">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span class="px-2 text-gray-400">...</span>`;
        }
        html += `<button onclick="goToPage(${totalPages})" class="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-blue-50 border">${totalPages}</button>`;
    }

    // Next button
    html += `
        <button onclick="goToPage(${currentPage + 1})" 
            class="px-4 py-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-blue-50'} border"
            ${currentPage === totalPages ? 'disabled' : ''}>
            Next →
        </button>
    `;

    container.innerHTML = html;
}

// Go to specific page
function goToPage(page) {
    const totalPages = Math.ceil(filteredTests.length / TESTS_PER_PAGE);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderTests();
    
    // Scroll to top of tests
    document.getElementById('testsContainer').scrollIntoView({ behavior: 'smooth' });
}

// Open test details modal
function openTestDetails(testId) {
    selectedTest = allTests.find(t => t._id === testId);
    if (!selectedTest) return;

    const modal = document.getElementById('testDetailsModal');
    document.getElementById('modalTestTitle').textContent = selectedTest.title || 'Untitled Test';

    const questionsCount = selectedTest.totalQuestions || selectedTest.questions?.length || 0;
    const duration = selectedTest.duration || 60;

    const content = `
        <div class="space-y-4">
            <p class="text-gray-600">${sanitizeHTML(selectedTest.description || 'No description available')}</p>

            <div class="grid grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="stats-icon bg-blue-100 text-blue-600">📚</div>
                        <div>
                            <div class="text-xl font-bold text-gray-800">${questionsCount}</div>
                            <div class="text-sm text-gray-500">Questions</div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="stats-icon bg-green-100 text-green-600">⏱️</div>
                        <div>
                            <div class="text-xl font-bold text-gray-800">${duration} min</div>
                            <div class="text-sm text-gray-500">Duration</div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="stats-icon bg-purple-100 text-purple-600">📖</div>
                        <div>
                            <div class="text-xl font-bold text-gray-800">${sanitizeHTML(selectedTest.subject || 'General')}</div>
                            <div class="text-sm text-gray-500">Subject</div>
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 rounded-xl p-4">
                    <div class="flex items-center gap-3">
                        <div class="stats-icon bg-yellow-100 text-yellow-600">📅</div>
                        <div>
                            <div class="text-xl font-bold text-gray-800">${sanitizeHTML(selectedTest.academicYear || 'N/A')}</div>
                            <div class="text-sm text-gray-500">Academic Year</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-blue-50 rounded-xl p-4">
                <h4 class="font-semibold text-blue-800 mb-2">📋 Test Instructions</h4>
                <ul class="text-sm text-blue-700 space-y-1">
                    <li>• Each question carries equal marks</li>
                    <li>• No negative marking for wrong answers</li>
                    <li>• You can mark questions for review and come back later</li>
                    <li>• Timer will start once you begin the test</li>
                    <li>• Results will be shown after test submission</li>
                </ul>
            </div>

            ${selectedTest.topics && selectedTest.topics.length > 0 ? `
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">Topics Covered</h4>
                    <div class="flex flex-wrap gap-2">
                        ${selectedTest.topics.map(topic => `<span class="subject-tag">${sanitizeHTML(topic)}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('modalTestContent').innerHTML = content;
    modal.classList.remove('hidden');
}

// Close test details modal
function closeTestDetailsModal() {
    document.getElementById('testDetailsModal').classList.add('hidden');
    selectedTest = null;
}

// Start test from modal
function startTest() {
    if (!selectedTest) return;
    startTestDirect(selectedTest._id);
}

// Start test directly
function startTestDirect(testId) {
    // Navigate to practice interface with test ID
    window.location.href = `practice-interface.html?testId=${testId}`;
}

// Render empty state
function renderEmptyState() {
    const container = document.getElementById('testsContainer');
    container.innerHTML = '';
    document.getElementById('emptyState').classList.remove('hidden');
}

// Note: sanitizeHTML and showToast are loaded from shared/utils.js

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeTestDetailsModal();
    }
});

// Close modal on backdrop click
document.getElementById('testDetailsModal').addEventListener('click', (e) => {
    if (e.target.id === 'testDetailsModal') {
        closeTestDetailsModal();
    }
});
