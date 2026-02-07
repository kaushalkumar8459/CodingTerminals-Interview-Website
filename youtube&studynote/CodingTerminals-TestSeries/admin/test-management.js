// File: CodingTerminals-TestSeries/admin/test-management.js
// Test Management Admin Interface

'use strict';

// ==================== CONFIGURATION ====================

const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    return typeof APP_CONFIG !== 'undefined' ? APP_CONFIG.BASE_URL : '';
})();

const API_ENDPOINTS = {
    TESTS: `${API_BASE_URL}/api/tests`,
    QUESTIONS: `${API_BASE_URL}/api/questions`
};

// Default user for API calls (replace with actual auth when available)
const DEFAULT_USER = {
    _id: '507f1f77bcf86cd799439011',
    username: 'admin',
    email: 'admin@codingterminals.com'
};

// ==================== STATE MANAGEMENT ====================

let allTests = [];
let filteredTests = [];
let allQuestions = [];
let selectedQuestionIds = new Set();
let tempSelectedQuestions = new Set(); // For modal selections
let currentPage = 1;
let pageSize = 10;
let editingTestId = null;
let isEditMode = false;

// ==================== INITIALIZATION ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Test Management initialized');
    loadTests();
    loadQuestions(); // This will also populate dropdowns from DB
});

/**
 * Initialize dropdown options from database values
 */
function initializeDropdownsFromDB(subjects, years) {
    // Sort alphabetically
    subjects = [...subjects].sort();
    years = [...years].sort().reverse(); // Most recent first

    // Populate datalists for create form
    const subjectList = document.getElementById('subjectList');
    const yearList = document.getElementById('yearList');
    
    if (subjectList) {
        subjectList.innerHTML = subjects.map(s => `<option value="${s}">`).join('');
    }
    
    if (yearList) {
        yearList.innerHTML = years.map(y => `<option value="${y}">`).join('');
    }

    // Populate filter dropdowns
    const filterSubject = document.getElementById('filterSubject');
    if (filterSubject) {
        // Clear existing options except "All Subjects"
        filterSubject.innerHTML = '<option value="all">All Subjects</option>';
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            filterSubject.appendChild(opt);
        });
    }

    // Populate question selector dropdowns
    const qsSubject = document.getElementById('qsSubject');
    if (qsSubject) {
        qsSubject.innerHTML = '<option value="all">All Subjects</option>';
        subjects.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.textContent = s;
            qsSubject.appendChild(opt);
        });
    }

    const qsYear = document.getElementById('qsYear');
    if (qsYear) {
        qsYear.innerHTML = '<option value="all">All Years</option>';
        years.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            qsYear.appendChild(opt);
        });
    }
    
    console.log(`📋 Dropdowns populated: ${subjects.length} subjects, ${years.length} years`);
}

// ==================== TAB MANAGEMENT ====================

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Deactivate all tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }
    
    // Activate selected tab button
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(tabName.replace('-', ' ').split(' ')[0])) {
            btn.classList.add('active');
        }
    });
}

// ==================== API CALLS ====================

/**
 * Load all tests from API
 */
async function loadTests() {
    showLoading(true, 'Loading tests...');
    try {
        const response = await fetch(`${API_ENDPOINTS.TESTS}?isActive=true&isPublished=all&limit=100`);
        const data = await response.json();
        
        if (data.success) {
            allTests = data.data || [];
            filteredTests = [...allTests];
            renderTests();
            updateTestCount();
        } else {
            throw new Error(data.error || 'Failed to load tests');
        }
    } catch (error) {
        console.error('Error loading tests:', error);
        showToast('Failed to load tests: ' + error.message, 'error');
        allTests = [];
        filteredTests = [];
        renderTests();
    } finally {
        hideLoading();
    }
}

/**
 * Load all questions for selection
 */
async function loadQuestions() {
    try {
        const response = await fetch(`${API_ENDPOINTS.QUESTIONS}?limit=1000`);
        const data = await response.json();
        
        if (data.success) {
            allQuestions = data.data || [];
            console.log(`📚 Loaded ${allQuestions.length} questions`);
            
            // Extract unique subjects and years from questions
            const uniqueSubjects = new Set();
            const uniqueYears = new Set();
            
            allQuestions.forEach(q => {
                if (q.subject) uniqueSubjects.add(q.subject);
                if (q.academicYear) uniqueYears.add(q.academicYear);
            });
            
            // Populate dropdowns with DB values
            initializeDropdownsFromDB(
                Array.from(uniqueSubjects),
                Array.from(uniqueYears)
            );
        } else {
            throw new Error(data.error || 'Failed to load questions');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        allQuestions = [];
        // Initialize with empty arrays if questions fail to load
        initializeDropdownsFromDB([], []);
    }
}

/**
 * Create a new test
 */
async function createTest(event) {
    event.preventDefault();
    
    const title = document.getElementById('testTitle').value.trim();
    const duration = parseInt(document.getElementById('testDuration').value);
    const subject = document.getElementById('testSubject').value.trim();
    const year = document.getElementById('testYear').value.trim();
    const description = document.getElementById('testDescription').value.trim();
    
    if (selectedQuestionIds.size === 0) {
        showToast('Please select at least one question', 'warning');
        return;
    }
    
    const testData = {
        title,
        description,
        subject,
        academicYear: year,
        duration,
        totalQuestions: selectedQuestionIds.size,
        questions: Array.from(selectedQuestionIds),
        isPublished: false,
        createdBy: DEFAULT_USER._id
    };
    
    showLoading(true, 'Creating test...');
    
    try {
        const response = await fetch(API_ENDPOINTS.TESTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Test created successfully!', 'success');
            resetCreateForm();
            loadTests();
            switchTab('all-tests');
        } else {
            throw new Error(data.error || 'Failed to create test');
        }
    } catch (error) {
        console.error('Error creating test:', error);
        showToast('Failed to create test: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Auto-generate a test
 */
async function autoGenerateTest(event) {
    event.preventDefault();
    
    const subject = document.getElementById('autoSubject').value.trim();
    const year = document.getElementById('autoYear').value.trim();
    const totalQuestions = parseInt(document.getElementById('autoTotalQuestions').value);
    const duration = parseInt(document.getElementById('autoDuration').value);
    
    const difficultyDistribution = {
        beginner: parseInt(document.getElementById('autoBeginner').value) || 0,
        intermediate: parseInt(document.getElementById('autoIntermediate').value) || 0,
        advanced: parseInt(document.getElementById('autoAdvanced').value) || 0,
        expert: parseInt(document.getElementById('autoExpert').value) || 0
    };
    
    const requestData = {
        subject,
        academicYear: year,
        totalQuestions,
        duration,
        difficultyDistribution,
        createdBy: DEFAULT_USER._id
    };
    
    showLoading(true, 'Generating test...');
    
    try {
        const response = await fetch(`${API_ENDPOINTS.TESTS}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(`Test generated successfully with ${data.data.questions.length} questions!`, 'success');
            loadTests();
            switchTab('all-tests');
        } else {
            throw new Error(data.error || 'Failed to generate test');
        }
    } catch (error) {
        console.error('Error generating test:', error);
        showToast('Failed to generate test: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Update an existing test
 */
async function updateTest(event) {
    event.preventDefault();
    
    const testId = document.getElementById('editTestId').value;
    const title = document.getElementById('editTitle').value.trim();
    const duration = parseInt(document.getElementById('editDuration').value);
    const subject = document.getElementById('editSubject').value.trim();
    const year = document.getElementById('editYear').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    
    if (selectedQuestionIds.size === 0) {
        showToast('Please select at least one question', 'warning');
        return;
    }
    
    const testData = {
        title,
        description,
        subject,
        academicYear: year,
        duration,
        totalQuestions: selectedQuestionIds.size,
        questions: Array.from(selectedQuestionIds)
    };
    
    showLoading(true, 'Updating test...');
    
    try {
        const response = await fetch(`${API_ENDPOINTS.TESTS}/${testId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Test updated successfully!', 'success');
            closeEditModal();
            loadTests();
        } else {
            throw new Error(data.error || 'Failed to update test');
        }
    } catch (error) {
        console.error('Error updating test:', error);
        showToast('Failed to update test: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Delete a test
 */
async function deleteTest(testId) {
    const confirmed = await showConfirmDialog(
        'Delete Test',
        'Are you sure you want to delete this test? This action cannot be undone.',
        'Delete',
        'Cancel'
    );
    
    if (!confirmed) return;
    
    showLoading(true, 'Deleting test...');
    
    try {
        const response = await fetch(`${API_ENDPOINTS.TESTS}/${testId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Test deleted successfully!', 'success');
            loadTests();
        } else {
            throw new Error(data.error || 'Failed to delete test');
        }
    } catch (error) {
        console.error('Error deleting test:', error);
        showToast('Failed to delete test: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

/**
 * Toggle publish status of a test
 */
async function togglePublish(testId, currentStatus) {
    const action = currentStatus ? 'unpublish' : 'publish';
    
    showLoading(true, `${currentStatus ? 'Moving to draft' : 'Publishing'} test...`);
    
    try {
        const response = await fetch(`${API_ENDPOINTS.TESTS}/${testId}/${action}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message || `Test ${action}ed successfully!`, 'success');
            loadTests();
        } else {
            throw new Error(data.error || `Failed to ${action} test`);
        }
    } catch (error) {
        console.error(`Error ${action}ing test:`, error);
        showToast(`Failed to ${action} test: ` + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ==================== RENDERING ====================

/**
 * Render tests list
 */
function renderTests() {
    const container = document.getElementById('testsContainer');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredTests.length === 0) {
        container.innerHTML = '';
        if (emptyState) {
            emptyState.style.display = 'block';
            container.appendChild(emptyState);
        }
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Paginate
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageTests = filteredTests.slice(startIndex, endIndex);
    
    container.innerHTML = pageTests.map(test => renderTestCard(test)).join('');
    
    // Render pagination
    renderPagination();
}

/**
 * Render a single test card
 */
function renderTestCard(test) {
    const statusClass = test.isPublished ? 'published' : 'draft';
    const statusBadge = test.isPublished 
        ? '<span class="status-badge status-published">Published</span>'
        : '<span class="status-badge status-draft">Draft</span>';
    
    const questionsCount = test.questions ? test.questions.length : test.totalQuestions || 0;
    
    const difficultyBadges = test.difficultyDistribution 
        ? Object.entries(test.difficultyDistribution)
            .filter(([_, count]) => count > 0)
            .map(([diff, count]) => `<span class="difficulty-badge difficulty-${diff.toLowerCase()}">${diff}: ${count}</span>`)
            .join(' ')
        : '';
    
    const createdDate = test.createdAt ? new Date(test.createdAt).toLocaleDateString() : 'N/A';
    
    return `
        <div class="test-card ${statusClass}">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                        <h3 class="text-lg font-bold text-gray-800 break-words">${sanitizeHTML(test.title)}</h3>
                        ${statusBadge}
                    </div>
                    <p class="text-sm text-gray-600 mb-3 break-words">${sanitizeHTML(test.description || 'No description')}</p>
                    
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-sm text-gray-500">
                        <span class="flex items-center gap-1">📚 ${sanitizeHTML(test.subject)}</span>
                        <span class="flex items-center gap-1">📅 ${sanitizeHTML(test.academicYear)}</span>
                        <span class="flex items-center gap-1">⏱️ ${test.duration} mins</span>
                        <span class="flex items-center gap-1">📝 ${questionsCount} Qs</span>
                        <span class="flex items-center gap-1">📆 ${createdDate}</span>
                    </div>
                    
                    ${difficultyBadges ? `<div class="mt-2 flex flex-wrap gap-2">${difficultyBadges}</div>` : ''}
                </div>
                
                <!-- Action buttons - responsive grid -->
                <div class="flex flex-wrap gap-2 lg:flex-nowrap lg:ml-4">
                    <button onclick="viewTest('${test._id}')" title="View Details"
                        class="flex-1 lg:flex-none p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1 min-w-[40px]">
                        <span>👁️</span><span class="lg:hidden text-xs">View</span>
                    </button>
                    <button onclick="editTest('${test._id}')" title="Edit"
                        class="flex-1 lg:flex-none p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center gap-1 min-w-[40px]">
                        <span>✏️</span><span class="lg:hidden text-xs">Edit</span>
                    </button>
                    <button onclick="togglePublish('${test._id}', ${test.isPublished})" 
                        title="${test.isPublished ? 'Move to Draft' : 'Publish'}"
                        class="flex-1 lg:flex-none px-3 py-2 ${test.isPublished ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-green-100 text-green-600 hover:bg-green-200'} rounded-lg transition-colors font-semibold text-sm flex items-center justify-center gap-1 whitespace-nowrap">
                        ${test.isPublished ? '⏸️ Draft' : '🚀 Publish'}
                    </button>
                    <button onclick="duplicateTest('${test._id}')" title="Duplicate"
                        class="flex-1 lg:flex-none p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors flex items-center justify-center gap-1 min-w-[40px]">
                        <span>📋</span><span class="lg:hidden text-xs">Copy</span>
                    </button>
                    <button onclick="deleteTest('${test._id}')" title="Delete"
                        class="flex-1 lg:flex-none p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center gap-1 min-w-[40px]">
                        <span>🗑️</span><span class="lg:hidden text-xs">Delete</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render pagination
 */
function renderPagination() {
    const container = document.getElementById('paginationContainer');
    if (!container) return;
    
    const totalPages = Math.ceil(filteredTests.length / pageSize);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="flex flex-wrap justify-center items-center gap-1 sm:gap-2">';
    
    // Previous button
    html += `<button onclick="goToPage(${currentPage - 1})" 
        class="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}"
        ${currentPage === 1 ? 'disabled' : ''}>
        <span class="hidden sm:inline">← Prev</span><span class="sm:hidden">←</span>
    </button>`;
    
    // Page numbers - show fewer on mobile
    for (let i = 1; i <= totalPages; i++) {
        // On mobile show fewer pages
        const showOnMobile = i === 1 || i === totalPages || i === currentPage;
        const showOnDesktop = i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2);
        
        if (showOnDesktop) {
            const mobileHidden = !showOnMobile ? 'hidden sm:inline-flex' : 'inline-flex';
            html += `<button onclick="goToPage(${i})" 
                class="${mobileHidden} px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${i === currentPage ? 'bg-purple-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}">
                ${i}
            </button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += '<span class="hidden sm:inline px-1 sm:px-2">...</span>';
        }
    }
    
    // Next button
    html += `<button onclick="goToPage(${currentPage + 1})" 
        class="px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}"
        ${currentPage === totalPages ? 'disabled' : ''}>
        <span class="hidden sm:inline">Next →</span><span class="sm:hidden">→</span>
    </button>`;
    
    html += '</div>';
    container.innerHTML = html;
}

/**
 * Go to specific page
 */
function goToPage(page) {
    const totalPages = Math.ceil(filteredTests.length / pageSize);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderTests();
}

/**
 * Update test count display
 */
function updateTestCount() {
    const countEl = document.getElementById('testCount');
    if (countEl) {
        countEl.textContent = `(${filteredTests.length} tests)`;
    }
}

// ==================== FILTERING ====================

/**
 * Apply filters
 */
function applyFilters() {
    const subject = document.getElementById('filterSubject').value;
    const status = document.getElementById('filterStatus').value;
    
    filteredTests = allTests.filter(test => {
        const matchSubject = subject === 'all' || test.subject === subject;
        const matchStatus = status === 'all' || 
            (status === 'published' && test.isPublished) ||
            (status === 'draft' && !test.isPublished);
        
        return matchSubject && matchStatus;
    });
    
    currentPage = 1;
    renderTests();
    updateTestCount();
}

/**
 * Refresh tests
 */
function refreshTests() {
    document.getElementById('filterSubject').value = 'all';
    document.getElementById('filterStatus').value = 'all';
    loadTests();
}

// ==================== QUESTION SELECTOR ====================

/**
 * Open question selector modal
 */
function openQuestionSelector() {
    isEditMode = false;
    tempSelectedQuestions = new Set(selectedQuestionIds);
    document.getElementById('questionSelectorModal').classList.add('active');
    renderAvailableQuestions();
}

/**
 * Open question selector for edit mode
 */
function openQuestionSelectorForEdit() {
    isEditMode = true;
    tempSelectedQuestions = new Set(selectedQuestionIds);
    document.getElementById('questionSelectorModal').classList.add('active');
    renderAvailableQuestions();
}

/**
 * Close question selector modal
 */
function closeQuestionSelector() {
    document.getElementById('questionSelectorModal').classList.remove('active');
}

/**
 * Render available questions in selector
 */
function renderAvailableQuestions() {
    const container = document.getElementById('availableQuestionsList');
    const search = document.getElementById('qsSearch').value.toLowerCase();
    const subject = document.getElementById('qsSubject').value;
    const difficulty = document.getElementById('qsDifficulty').value;
    const year = document.getElementById('qsYear').value;
    
    const filtered = allQuestions.filter(q => {
        const matchSearch = !search || 
            (q.question && q.question.toLowerCase().includes(search)) ||
            (q.topic && q.topic.toLowerCase().includes(search));
        const matchSubject = subject === 'all' || q.subject === subject;
        const matchDifficulty = difficulty === 'all' || q.difficulty === difficulty;
        const matchYear = year === 'all' || q.academicYear === year;
        
        return matchSearch && matchSubject && matchDifficulty && matchYear;
    });
    
    document.getElementById('availableCount').textContent = filtered.length;
    document.getElementById('modalSelectedCount').textContent = tempSelectedQuestions.size;
    
    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400 py-4">No questions found matching your filters</p>';
        return;
    }
    
    container.innerHTML = filtered.map(q => {
        const isSelected = tempSelectedQuestions.has(q._id);
        const questionText = stripHTML(q.question || 'No question text');
        const truncatedText = questionText.length > 100 ? questionText.substring(0, 100) + '...' : questionText;
        
        return `
            <div class="question-item ${isSelected ? 'selected' : ''}" onclick="toggleQuestionSelection('${q._id}')">
                <div class="flex items-start gap-3">
                    <input type="checkbox" ${isSelected ? 'checked' : ''} 
                        class="mt-1 w-4 h-4 text-purple-600 rounded" 
                        onclick="event.stopPropagation(); toggleQuestionSelection('${q._id}')">
                    <div class="flex-1">
                        <p class="text-sm text-gray-800 question-text">${sanitizeHTML(truncatedText)}</p>
                        <div class="flex gap-2 mt-1 text-xs text-gray-500">
                            <span>${sanitizeHTML(q.subject || 'N/A')}</span>
                            <span class="difficulty-badge difficulty-${(q.difficulty || 'beginner').toLowerCase()}">${q.difficulty || 'N/A'}</span>
                            ${q.questionNumber ? `<span>Q.${q.questionNumber}</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Filter available questions
 */
function filterAvailableQuestions() {
    renderAvailableQuestions();
}

/**
 * Toggle question selection
 */
function toggleQuestionSelection(questionId) {
    if (tempSelectedQuestions.has(questionId)) {
        tempSelectedQuestions.delete(questionId);
    } else {
        tempSelectedQuestions.add(questionId);
    }
    renderAvailableQuestions();
}

/**
 * Select all visible questions
 */
function selectAllVisible() {
    const search = document.getElementById('qsSearch').value.toLowerCase();
    const subject = document.getElementById('qsSubject').value;
    const difficulty = document.getElementById('qsDifficulty').value;
    const year = document.getElementById('qsYear').value;
    
    allQuestions.filter(q => {
        const matchSearch = !search || 
            (q.question && q.question.toLowerCase().includes(search)) ||
            (q.topic && q.topic.toLowerCase().includes(search));
        const matchSubject = subject === 'all' || q.subject === subject;
        const matchDifficulty = difficulty === 'all' || q.difficulty === difficulty;
        const matchYear = year === 'all' || q.academicYear === year;
        
        return matchSearch && matchSubject && matchDifficulty && matchYear;
    }).forEach(q => tempSelectedQuestions.add(q._id));
    
    renderAvailableQuestions();
}

/**
 * Clear all selections
 */
function clearAllSelections() {
    tempSelectedQuestions.clear();
    renderAvailableQuestions();
}

/**
 * Confirm question selection
 */
function confirmQuestionSelection() {
    selectedQuestionIds = new Set(tempSelectedQuestions);
    updateSelectedQuestionsDisplay();
    closeQuestionSelector();
    
    if (isEditMode) {
        document.getElementById('editQuestionCount').textContent = selectedQuestionIds.size;
        renderEditQuestionsList();
    }
}

/**
 * Update selected questions display in create form
 */
function updateSelectedQuestionsDisplay() {
    const countEl = document.getElementById('selectedCount');
    const noQuestionsMsg = document.getElementById('noQuestionsMessage');
    const listContainer = document.getElementById('selectedQuestionsList');
    
    if (countEl) countEl.textContent = selectedQuestionIds.size;
    
    if (selectedQuestionIds.size === 0) {
        if (noQuestionsMsg) noQuestionsMsg.classList.remove('hidden');
        if (listContainer) listContainer.classList.add('hidden');
        return;
    }
    
    if (noQuestionsMsg) noQuestionsMsg.classList.add('hidden');
    if (listContainer) listContainer.classList.remove('hidden');
    
    const selectedQuestions = allQuestions.filter(q => selectedQuestionIds.has(q._id));
    
    listContainer.innerHTML = selectedQuestions.map((q, index) => {
        const questionText = stripHTML(q.question || 'No question text');
        const truncatedText = questionText.length > 80 ? questionText.substring(0, 80) + '...' : questionText;
        
        return `
            <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400">${index + 1}.</span>
                    <span class="text-sm text-gray-700">${sanitizeHTML(truncatedText)}</span>
                </div>
                <button onclick="removeSelectedQuestion('${q._id}')" class="text-red-500 hover:text-red-700 text-sm">✕</button>
            </div>
        `;
    }).join('');
}

/**
 * Remove a selected question
 */
function removeSelectedQuestion(questionId) {
    selectedQuestionIds.delete(questionId);
    updateSelectedQuestionsDisplay();
}

// ==================== VIEW TEST ====================

/**
 * View test details
 */
function viewTest(testId) {
    const test = allTests.find(t => t._id === testId);
    if (!test) {
        showToast('Test not found', 'error');
        return;
    }
    
    const container = document.getElementById('viewTestContent');
    const statusBadge = test.isPublished 
        ? '<span class="status-badge status-published">Published</span>'
        : '<span class="status-badge status-draft">Draft</span>';
    
    const questions = test.questions || [];
    
    container.innerHTML = `
        <div class="space-y-4">
            <div class="flex items-center gap-3">
                <h4 class="text-xl font-bold text-gray-800">${sanitizeHTML(test.title)}</h4>
                ${statusBadge}
            </div>
            
            <p class="text-gray-600">${sanitizeHTML(test.description || 'No description')}</p>
            
            <div class="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
                <div><span class="text-gray-500">Subject:</span> <strong>${sanitizeHTML(test.subject)}</strong></div>
                <div><span class="text-gray-500">Academic Year:</span> <strong>${sanitizeHTML(test.academicYear)}</strong></div>
                <div><span class="text-gray-500">Duration:</span> <strong>${test.duration} minutes</strong></div>
                <div><span class="text-gray-500">Total Questions:</span> <strong>${questions.length}</strong></div>
            </div>
            
            <div>
                <h5 class="font-semibold text-gray-700 mb-2">Questions (${questions.length})</h5>
                <div class="max-h-[300px] overflow-y-auto space-y-2">
                    ${questions.map((q, i) => {
                        const questionText = typeof q === 'object' ? stripHTML(q.question || 'N/A') : 'Question ID: ' + q;
                        const truncatedText = questionText.length > 100 ? questionText.substring(0, 100) + '...' : questionText;
                        const difficulty = typeof q === 'object' ? q.difficulty : 'N/A';
                        
                        return `
                            <div class="p-2 bg-gray-50 rounded border border-gray-200">
                                <span class="text-xs text-gray-400">${i + 1}.</span>
                                <span class="text-sm text-gray-700">${sanitizeHTML(truncatedText)}</span>
                                ${difficulty !== 'N/A' ? `<span class="difficulty-badge difficulty-${difficulty.toLowerCase()} ml-2">${difficulty}</span>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('viewTestModal').classList.add('active');
}

/**
 * Close view modal
 */
function closeViewModal() {
    document.getElementById('viewTestModal').classList.remove('active');
}

// ==================== EDIT TEST ====================

/**
 * Open edit modal for a test
 */
function editTest(testId) {
    const test = allTests.find(t => t._id === testId);
    if (!test) {
        showToast('Test not found', 'error');
        return;
    }
    
    editingTestId = testId;
    
    // Populate form
    document.getElementById('editTestId').value = test._id;
    document.getElementById('editTitle').value = test.title;
    document.getElementById('editDuration').value = test.duration;
    document.getElementById('editSubject').value = test.subject;
    document.getElementById('editYear').value = test.academicYear;
    document.getElementById('editDescription').value = test.description || '';
    
    // Set selected questions
    selectedQuestionIds = new Set(test.questions.map(q => typeof q === 'object' ? q._id : q));
    document.getElementById('editQuestionCount').textContent = selectedQuestionIds.size;
    renderEditQuestionsList();
    
    document.getElementById('editTestModal').classList.add('active');
}

/**
 * Render questions list in edit modal
 */
function renderEditQuestionsList() {
    const container = document.getElementById('editQuestionsList');
    const selectedQuestions = allQuestions.filter(q => selectedQuestionIds.has(q._id));
    
    if (selectedQuestions.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-2">No questions selected</p>';
        return;
    }
    
    container.innerHTML = selectedQuestions.map((q, index) => {
        const questionText = stripHTML(q.question || 'No question text');
        const truncatedText = questionText.length > 60 ? questionText.substring(0, 60) + '...' : questionText;
        
        return `
            <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-200 mb-1">
                <span class="text-sm text-gray-700">${index + 1}. ${sanitizeHTML(truncatedText)}</span>
            </div>
        `;
    }).join('');
}

/**
 * Close edit modal
 */
function closeEditModal() {
    document.getElementById('editTestModal').classList.remove('active');
    editingTestId = null;
    selectedQuestionIds.clear();
}

// ==================== DUPLICATE TEST ====================

/**
 * Duplicate a test
 */
async function duplicateTest(testId) {
    const test = allTests.find(t => t._id === testId);
    if (!test) {
        showToast('Test not found', 'error');
        return;
    }
    
    const confirmed = await showConfirmDialog(
        'Duplicate Test',
        `Create a copy of "${test.title}"?`,
        'Duplicate',
        'Cancel'
    );
    
    if (!confirmed) return;
    
    const newTestData = {
        title: `${test.title} (Copy)`,
        description: test.description,
        subject: test.subject,
        academicYear: test.academicYear,
        duration: test.duration,
        totalQuestions: test.totalQuestions,
        questions: test.questions.map(q => typeof q === 'object' ? q._id : q),
        isPublished: false,
        createdBy: DEFAULT_USER._id
    };
    
    showLoading(true, 'Duplicating test...');
    
    try {
        const response = await fetch(API_ENDPOINTS.TESTS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTestData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast('Test duplicated successfully!', 'success');
            loadTests();
        } else {
            throw new Error(data.error || 'Failed to duplicate test');
        }
    } catch (error) {
        console.error('Error duplicating test:', error);
        showToast('Failed to duplicate test: ' + error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ==================== FORM UTILITIES ====================

/**
 * Reset create form
 */
function resetCreateForm() {
    document.getElementById('createTestForm').reset();
    selectedQuestionIds.clear();
    updateSelectedQuestionsDisplay();
}

// ==================== UTILITY FUNCTIONS ====================
// Note: sanitizeHTML, showToast, showConfirmDialog, showLoading are imported from utils.js

/**
 * Strip HTML tags from string
 */
function stripHTML(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

/**
 * Hide loading overlay (wrapper for showLoading from utils.js)
 */
function hideLoading() {
    if (typeof showLoading === 'function') {
        showLoading(false);
    } else {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
        }
    }
}

/**
 * Show loading with message (wrapper for consistency)
 */
function showLoadingMessage(message = 'Loading...') {
    if (typeof showLoading === 'function') {
        showLoading(true, message);
    }
}

/**
 * Logout function (placeholder)
 */
function logout() {
    if (typeof AuthUtils !== 'undefined' && AuthUtils.logout) {
        AuthUtils.logout();
    } else {
        window.location.href = '../../auth/login.html';
    }
}
