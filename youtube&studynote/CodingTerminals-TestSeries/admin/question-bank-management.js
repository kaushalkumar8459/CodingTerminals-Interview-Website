// File: CodingTerminals-TestSeries/admin/question-bank-management.js

// Global Variables
let allQuestions = [];
let filteredQuestions = [];
let selectedQuestions = new Set();
let currentEditingQuestion = null;
let currentTab = 'question-bank';
let currentCreationMethod = 'manual';
let testQuestions = [];
let groups = [];
let duplicates = [];

// API Endpoints Configuration
const API_CONFIG = {
    BASE_URL: typeof appConfig !== 'undefined' && appConfig.API_BASE_URL ? appConfig.API_BASE_URL : 'http://localhost:3000/api',
    ENDPOINTS: {
        GET_ALL_QUESTIONS: '/questions',
        GET_QUESTIONS_BY_SUBJECT: '/questions/subject/',
        GET_QUESTIONS_BY_YEAR: '/questions/year/',
        GET_QUESTIONS_BY_DIFFICULTY: '/questions/difficulty/',
        CREATE_QUESTION: '/questions',
        UPDATE_QUESTION: '/questions/',
        DELETE_QUESTION: '/questions/',
        BULK_DELETE: '/questions/bulk-delete',
        FIND_DUPLICATES: '/questions/duplicates/find',
        CREATE_GROUP: '/groups',
        ASSIGN_TO_GROUP: '/groups/assign',
        GET_GROUPS: '/groups',
        CREATE_TEST: '/tests',
        GET_TESTS: '/tests',
        GET_ANALYTICS: '/analytics'
    }
};

// Construct full API URLs
const API_URLS = {
    GET_ALL_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ALL_QUESTIONS,
    GET_QUESTIONS_BY_SUBJECT: (subject) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_QUESTIONS_BY_SUBJECT + subject,
    GET_QUESTIONS_BY_YEAR: (year) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_QUESTIONS_BY_YEAR + year,
    GET_QUESTIONS_BY_DIFFICULTY: (difficulty) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_QUESTIONS_BY_DIFFICULTY + difficulty,
    CREATE_QUESTION: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_QUESTION,
    UPDATE_QUESTION: (id) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.UPDATE_QUESTION + id,
    DELETE_QUESTION: (id) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DELETE_QUESTION + id,
    BULK_DELETE: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.BULK_DELETE,
    FIND_DUPLICATES: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.FIND_DUPLICATES,
    CREATE_GROUP: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_GROUP,
    ASSIGN_TO_GROUP: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ASSIGN_TO_GROUP,
    GET_GROUPS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_GROUPS,
    CREATE_TEST: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_TEST,
    GET_TESTS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_TESTS,
    GET_ANALYTICS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ANALYTICS
};

// Switch between tabs
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');

    // Add active class to clicked button
    event.target.classList.add('active');

    currentTab = tabName;

    // Load data based on tab
    if (tabName === 'question-bank') {
        loadQuestions();
    } else if (tabName === 'test-creator') {
        loadTestCreatorData();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

// Switch creation method in test creator
function switchCreationMethod(method) {
    currentCreationMethod = method;

    const criteriaSection = document.getElementById('criteriaSection');
    if (method === 'auto') {
        criteriaSection.classList.remove('hidden');
    } else {
        criteriaSection.classList.add('hidden');
    }

    // Highlight selected button
    document.querySelectorAll('[onclick*="switchCreationMethod"]').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'bg-purple-500', 'bg-indigo-500');
        btn.classList.add('bg-blue-500');
    });

    const targetButton = event.target;
    if (method === 'auto') {
        targetButton.classList.remove('bg-blue-500');
        targetButton.classList.add('bg-purple-500');
    } else if (method === 'template') {
        targetButton.classList.remove('bg-blue-500');
        targetButton.classList.add('bg-indigo-500');
    }
}

// Update percentage display for sliders
function updatePercentage(slider, displayId) {
    document.getElementById(displayId).textContent = slider.value + '%';

    // Ensure percentages sum to 100%
    const total = parseInt(document.getElementById('easyPercent').textContent) +
        parseInt(document.getElementById('mediumPercent').textContent) +
        parseInt(document.getElementById('hardPercent').textContent);

    if (total > 100) {
        // Adjust the last changed slider to maintain 100%
        const diff = total - 100;
        slider.value = parseInt(slider.value) - diff;
        document.getElementById(displayId).textContent = slider.value + '%';
    }
}

// Load questions from API
async function loadQuestions() {
    try {
        const response = await fetch(API_URLS.GET_ALL_QUESTIONS);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            allQuestions = result.data || [];

            // Extract unique values for filters
            extractUniqueValues();

            filteredQuestions = [...allQuestions];
            renderQuestionsList();
            renderFilters();
            updateStats();
        } else {
            showToast(result.message || 'Failed to load questions', 'error');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('Error loading questions: ' + error.message, 'error');
    }
}

// Extract unique values for filters
function extractUniqueValues() {
    const subjectFilter = document.getElementById('filterSubject');
    const yearFilter = document.getElementById('filterYear');
    const difficultyFilter = document.getElementById('filterDifficulty');

    if (!subjectFilter || !yearFilter || !difficultyFilter) return;

    // Clear existing options except "All"
    subjectFilter.innerHTML = '<option value="all">All Subjects</option>';
    yearFilter.innerHTML = '<option value="all">All Years</option>';
    difficultyFilter.innerHTML = '<option value="all">All Difficulties</option>';

    // Get unique values
    const uniqueSubjects = new Set();
    const uniqueYears = new Set();
    const uniqueDifficulties = new Set();

    allQuestions.forEach(question => {
        if (question.subject) uniqueSubjects.add(question.subject);
        if (question.academicYear) uniqueYears.add(question.academicYear);
        if (question.difficulty) uniqueDifficulties.add(question.difficulty);
    });

    // Add unique subjects
    uniqueSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });

    // Add unique years
    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    // Add unique difficulties
    uniqueDifficulties.forEach(difficulty => {
        const option = document.createElement('option');
        option.value = difficulty;
        option.textContent = difficulty;
        difficultyFilter.appendChild(option);
    });
}

// Render filters
function renderFilters() {
    // Filters are already handled in extractUniqueValues
}

// Apply filters to questions
function applyFilters() {
    const searchTerm = document.getElementById('searchQuestions')?.value?.toLowerCase() || '';
    const subjectFilter = document.getElementById('filterSubject')?.value || 'all';
    const yearFilter = document.getElementById('filterYear')?.value || 'all';
    const difficultyFilter = document.getElementById('filterDifficulty')?.value || 'all';
    const typeFilter = document.getElementById('filterType')?.value || 'all';

    filteredQuestions = allQuestions.filter(question => {
        const matchesSearch = !searchTerm ||
            question.question.toLowerCase().includes(searchTerm) ||
            question.subject.toLowerCase().includes(searchTerm) ||
            question.topic.toLowerCase().includes(searchTerm) ||
            question.explanation.toLowerCase().includes(searchTerm);

        const matchesSubject = subjectFilter === 'all' || question.subject === subjectFilter;
        const matchesYear = yearFilter === 'all' || question.academicYear === yearFilter;
        const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
        const matchesType = typeFilter === 'all' || question.type === typeFilter;

        return matchesSearch && matchesSubject && matchesYear && matchesDifficulty && matchesType;
    });

    renderQuestionsList();
    updateStats();
}

// Update statistics display
function updateStats() {
    const totalElement = document.getElementById('totalQuestionsCount');
    const selectedElement = document.getElementById('selectedQuestionsCount');
    const duplicatesElement = document.getElementById('duplicatesCount');

    if (totalElement) totalElement.textContent = allQuestions.length;
    if (selectedElement) selectedElement.textContent = selectedQuestions.size;
    if (duplicatesElement) duplicatesElement.textContent = duplicates.length;
}

// Render questions list
// Update renderQuestionsList function to handle both _id and id in HTML
function renderQuestionsList() {
    const container = document.getElementById('questionsContainer');
    const emptyState = document.getElementById('emptyState');

    if (!container || !emptyState) return;

    if (filteredQuestions.length === 0) {
        emptyState.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    emptyState.style.display = 'none';

    container.innerHTML = filteredQuestions.map((question, index) => {
        // Use _id if available, otherwise id
        const questionId = question._id || question.id;
        const isSelected = selectedQuestions.has(questionId);

        return `
            <div class="question-card ${isSelected ? 'selected-question' : ''}" onclick="toggleQuestionSelection('${questionId}')">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 mb-2">${question.question.substring(0, 100)}${question.question.length > 100 ? '...' : ''}</h4>
                        <div class="flex flex-wrap gap-2 mb-2">
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${question.subject}</span>
                            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${question.academicYear}</span>
                            <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">${question.examType}</span>
                            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">${question.difficulty}</span>
                            ${question.group ? `<span class="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">${question.group}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="event.stopPropagation(); editQuestion('${questionId}')" class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                            ✏️ Edit
                        </button>
                        <button onclick="event.stopPropagation(); deleteQuestion('${questionId}')" class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 mb-3">
                    ${question.options?.slice(0, 4).map((option, optIndex) => `
                        <div class="option-item ${optIndex === question.correctAnswer ? 'correct-answer' : ''}">
                            <label class="flex items-center">
                                <input type="radio" disabled ${optIndex === question.correctAnswer ? 'checked' : ''}>
                                <span class="ml-2">${String.fromCharCode(65 + optIndex)}. ${option.substring(0, 50)}${option.length > 50 ? '...' : ''}</span>
                                ${optIndex === question.correctAnswer ? '<span class="ml-2 text-green-600 text-xs">✓ Correct</span>' : ''}
                            </label>
                        </div>
                    `).join('')}
                    ${question.options?.length > 4 ? `<div class="text-xs text-gray-500">+ ${question.options.length - 4} more options</div>` : ''}
                </div>
                
                ${question.explanation ? `
                    <div class="bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <div class="text-xs text-blue-700">${question.explanation.substring(0, 100)}${question.explanation.length > 100 ? '...' : ''}</div>
                    </div>
                ` : ''}
                
                ${question.duplicateOf ? `
                    <div class="duplicate-indicator">
                        ⚠️ Duplicate of question: ${question.duplicateOf}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Update toggleQuestionSelection function to handle both _id and id
function toggleQuestionSelection(questionId) {
    if (selectedQuestions.has(questionId)) {
        selectedQuestions.delete(questionId);
    } else {
        selectedQuestions.add(questionId);
    }

    // Re-render the list to update selection indicators
    renderQuestionsList();
    updateStats();
}

// Toggle question selection
function toggleQuestionSelection(questionId) {
    if (selectedQuestions.has(questionId)) {
        selectedQuestions.delete(questionId);
    } else {
        selectedQuestions.add(questionId);
    }

    // Re-render the list to update selection indicators
    renderQuestionsList();
    updateStats();
}

// Edit question
function editQuestion(questionId) {
    // Try to find question by _id first, then by id
    const question = allQuestions.find(q => q._id === questionId || q.id === questionId);
    if (!question) {
        showToast('Question not found', 'error');
        return;
    }

    currentEditingQuestion = questionId;
    showEditModal(question);
}

// Show edit modal
function showEditModal(question) {
    const modal = document.getElementById('editModal');
    if (!modal) return;

    const formHTML = `
        <form id="editQuestionForm" onsubmit="saveEditedQuestion(event)">
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Question Text</label>
                    <textarea id="editQuestionText" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3">${question.question}</textarea>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                        <select id="editSubject" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                            <option value="Mathematics">Mathematics</option>
                            <option value="Physics">Physics</option>
                            <option value="Chemistry">Chemistry</option>
                            <option value="Biology">Biology</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="English">English</option>
                            <option value="History">History</option>
                            <option value="Geography">Geography</option>
                            <option value="Economics">Economics</option>
                            <option value="Accountancy">Accountancy</option>
                            <option value="Business Studies">Business Studies</option>
                            <option value="Political Science">Political Science</option>
                            <option value="Psychology">Psychology</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                        <input type="text" id="editYear" value="${question.academicYear || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Exam Type</label>
                        <select id="editExamType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                            <option value="Board Exam" ${question.examType === 'Board Exam' ? 'selected' : ''}>Board Exam</option>
                            <option value="University Exam" ${question.examType === 'University Exam' ? 'selected' : ''}>University Exam</option>
                            <option value="Competitive Exam" ${question.examType === 'Competitive Exam' ? 'selected' : ''}>Competitive Exam</option>
                            <option value="Mid-Term" ${question.examType === 'Mid-Term' ? 'selected' : ''}>Mid-Term</option>
                            <option value="Final Exam" ${question.examType === 'Final Exam' ? 'selected' : ''}>Final Exam</option>
                            <option value="Mock Test" ${question.examType === 'Mock Test' ? 'selected' : ''}>Mock Test</option>
                            <option value="Practice Paper" ${question.examType === 'Practice Paper' ? 'selected' : ''}>Practice Paper</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Difficulty Level</label>
                        <select id="editDifficulty" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                            <option value="Beginner" ${question.difficulty === 'Beginner' ? 'selected' : ''}>Beginner</option>
                            <option value="Intermediate" ${question.difficulty === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                            <option value="Advanced" ${question.difficulty === 'Advanced' ? 'selected' : ''}>Advanced</option>
                            <option value="Expert" ${question.difficulty === 'Expert' ? 'selected' : ''}>Expert</option>
                        </select>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Topic/Subtopic</label>
                    <input type="text" id="editTopic" value="${question.topic || ''}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" placeholder="e.g., Calculus, Thermodynamics, Shakespeare">
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Question Options</label>
                    <div id="editOptionsContainer">
                        ${question.options?.map((option, optIndex) => `
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-sm font-medium">${String.fromCharCode(65 + optIndex)}.</span>
                                <input type="text" 
                                       value="${option}" 
                                       id="editOption${optIndex}" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                <label class="flex items-center gap-1">
                                    <input type="radio" name="correctAnswer" value="${optIndex}" ${optIndex === question.correctAnswer ? 'checked' : ''}>
                                    <span class="text-sm">Correct</span>
                                </label>
                            </div>
                        `).join('') || ''}
                    </div>
                    <button type="button" onclick="addOptionField()" class="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                        ➕ Add Option
                    </button>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Explanation</label>
                    <textarea id="editExplanation" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3">${question.explanation || ''}</textarea>
                </div>
                
                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick="closeEditModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all">
                        Cancel
                    </button>
                    <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
                        Save Changes
                    </button>
                </div>
            </div>
        </form>
    `;

    document.getElementById('editFormContent').innerHTML = formHTML;

    // Set initial values
    document.getElementById('editSubject').value = question.subject || '';
    document.getElementById('editYear').value = question.academicYear || '';
    document.getElementById('editTopic').value = question.topic || '';
    document.getElementById('editExplanation').value = question.explanation || '';

    modal.classList.remove('hidden');
}

// Add option field
function addOptionField() {
    const container = document.getElementById('editOptionsContainer');
    const optionCount = container.children.length;
    const newIndex = optionCount;

    const optionHTML = `
        <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium">${String.fromCharCode(65 + newIndex)}.</span>
            <input type="text" 
                   id="editOption${newIndex}" 
                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                   placeholder="Option ${String.fromCharCode(65 + newIndex)}">
            <label class="flex items-center gap-1">
                <input type="radio" name="correctAnswer" value="${newIndex}">
                <span class="text-sm">Correct</span>
            </label>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', optionHTML);
}

// Save edited question
// async function saveEditedQuestion(event) {
//     event.preventDefault();

//     if (!currentEditingQuestion) {
//         showToast('No question selected for editing', 'error');
//         return;
//     }

//     const question = allQuestions.find(q => q.id === currentEditingQuestion);
//     if (!question) {
//         showToast('Question not found', 'error');
//         return;
//     }

//     // Get updated values
//     const updatedQuestion = {
//         id: question.id,
//         question: document.getElementById('editQuestionText').value,
//         subject: document.getElementById('editSubject').value,
//         academicYear: document.getElementById('editYear').value,
//         examType: document.getElementById('editExamType').value,
//         difficulty: document.getElementById('editDifficulty').value,
//         topic: document.getElementById('editTopic').value,
//         explanation: document.getElementById('editExplanation').value,
//         options: [],
//         correctAnswer: 0
//     };

//     // Get options
//     const optionElements = document.querySelectorAll('[id^="editOption"]');
//     updatedQuestion.options = Array.from(optionElements).map(el => el.value).filter(val => val.trim() !== '');

//     // Get correct answer
//     const correctAnswerRadio = document.querySelector('input[name="correctAnswer"]:checked');
//     if (correctAnswerRadio) {
//         updatedQuestion.correctAnswer = parseInt(correctAnswerRadio.value);
//     }

//     try {
//         const response = await fetch(API_URLS.UPDATE_QUESTION(question.id), {
//             method: 'PUT',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(updatedQuestion)
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();

//         if (result.success) {
//             // Update local data
//             Object.assign(question, updatedQuestion);

//             closeEditModal();
//             renderQuestionsList();
//             showToast('Question updated successfully!', 'success');
//         } else {
//             showToast(result.message || 'Failed to update question', 'error');
//         }
//     } catch (error) {
//         console.error('Error updating question:', error);
//         showToast('Error updating question: ' + error.message, 'error');
//     }
// }

async function saveEditedQuestion(event) {
    event.preventDefault();

    if (!currentEditingQuestion) {
        showToast('No question selected for editing', 'error');
        return;
    }

    // Try to find question by _id first, then by id
    const question = allQuestions.find(q => q._id === currentEditingQuestion || q.id === currentEditingQuestion);
    if (!question) {
        showToast('Question not found', 'error');
        return;
    }

    // Get updated values
    const updatedQuestion = {
        id: question.id || question._id,
        _id: question._id || question.id,
        question: document.getElementById('editQuestionText').value,
        subject: document.getElementById('editSubject').value,
        academicYear: document.getElementById('editYear').value,
        examType: document.getElementById('editExamType').value,
        difficulty: document.getElementById('editDifficulty').value,
        topic: document.getElementById('editTopic').value,
        explanation: document.getElementById('editExplanation').value,
        options: [],
        correctAnswer: 0
    };

    // Get options
    const optionElements = document.querySelectorAll('[id^="editOption"]');
    updatedQuestion.options = Array.from(optionElements).map(el => el.value).filter(val => val && val.trim() !== '');

    // Get correct answer
    const correctAnswerRadio = document.querySelector('input[name="correctAnswer"]:checked');
    if (correctAnswerRadio) {
        updatedQuestion.correctAnswer = parseInt(correctAnswerRadio.value);
    }

    try {
        const response = await fetch(API_URLS.UPDATE_QUESTION(currentEditingQuestion), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedQuestion)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Update local data
            Object.assign(question, updatedQuestion);

            closeEditModal();
            renderQuestionsList();
            showToast('Question updated successfully!', 'success');
        } else {
            showToast(result.message || 'Failed to update question', 'error');
        }
    } catch (error) {
        console.error('Error updating question:', error);
        showToast('Error updating question: ' + error.message, 'error');
    }
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.classList.add('hidden');
        currentEditingQuestion = null;
    }
}

// Delete question
async function deleteQuestion(questionId) {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(API_URLS.DELETE_QUESTION(questionId), {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Remove from local array - check both _id and id
            allQuestions = allQuestions.filter(q => !(q._id === questionId || q.id === questionId));
            filteredQuestions = filteredQuestions.filter(q => !(q._id === questionId || q.id === questionId));

            renderQuestionsList();
            updateStats();
            showToast('Question deleted successfully!', 'success');
        } else {
            showToast(result.message || 'Failed to delete question', 'error');
        }
    } catch (error) {
        console.error('Error deleting question:', error);
        showToast('Error deleting question: ' + error.message, 'error');
    }
}

// Bulk edit selected questions
function bulkEdit() {
    if (selectedQuestions.size === 0) {
        showToast('Please select questions to edit', 'warning');
        return;
    }

    // For now, just show a message - in real implementation, this would open a bulk edit form
    showToast(`Preparing to edit ${selectedQuestions.size} questions`, 'info');
}

// Bulk delete selected questions
// async function bulkDelete() {
//     if (selectedQuestions.size === 0) {
//         showToast('Please select questions to delete', 'warning');
//         return;
//     }

//     if (!confirm(`Are you sure you want to delete ${selectedQuestions.size} questions? This action cannot be undone.`)) {
//         return;
//     }

//     try {
//         const response = await fetch(API_URLS.BULK_DELETE, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ questionIds: Array.from(selectedQuestions) })
//         });

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const result = await response.json();

//         if (result.success) {
//             // Remove from local arrays
//             allQuestions = allQuestions.filter(q => !selectedQuestions.has(q.id));
//             filteredQuestions = filteredQuestions.filter(q => !selectedQuestions.has(q.id));

//             selectedQuestions.clear();

//             renderQuestionsList();
//             updateStats();
//             showToast(`${result.deleted || selectedQuestions.size} questions deleted successfully!`, 'success');
//         } else {
//             showToast(result.message || 'Failed to delete questions', 'error');
//         }
//     } catch (error) {
//         console.error('Error bulk deleting questions:', error);
//         showToast('Error deleting questions: ' + error.message, 'error');
//     }
// }

// Update bulkDelete function to handle both _id and id
async function bulkDelete() {
    if (selectedQuestions.size === 0) {
        showToast('Please select questions to delete', 'warning');
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedQuestions.size} questions? This action cannot be undone.`)) {
        return;
    }

    try {
        const response = await fetch(API_URLS.BULK_DELETE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questionIds: Array.from(selectedQuestions) })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Remove from local arrays - check both _id and id
            allQuestions = allQuestions.filter(q => {
                return !selectedQuestions.has(q._id) && !selectedQuestions.has(q.id);
            });

            filteredQuestions = filteredQuestions.filter(q => {
                return !selectedQuestions.has(q._id) && !selectedQuestions.has(q.id);
            });

            selectedQuestions.clear();

            renderQuestionsList();
            updateStats();
            showToast(`${result.deleted || selectedQuestions.size} questions deleted successfully!`, 'success');
        } else {
            showToast(result.message || 'Failed to delete questions', 'error');
        }
    } catch (error) {
        console.error('Error bulk deleting questions:', error);
        showToast('Error deleting questions: ' + error.message, 'error');
    }
}

// Detect duplicates
async function detectDuplicates() {
    try {
        const response = await fetch(API_URLS.FIND_DUPLICATES);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            duplicates = result.data || [];
            updateStats();

            if (duplicates.length > 0) {
                showToast(`${duplicates.length} duplicate questions found!`, 'warning');
            } else {
                showToast('No duplicates found', 'success');
            }
        } else {
            showToast(result.message || 'Failed to detect duplicates', 'error');
        }
    } catch (error) {
        console.error('Error detecting duplicates:', error);
        showToast('Error detecting duplicates: ' + error.message, 'error');
    }
}

// Export selected questions
function exportQuestions() {
    if (selectedQuestions.size === 0) {
        showToast('Please select questions to export', 'warning');
        return;
    }

    // In real implementation, this would export to CSV/Excel
    showToast(`Exporting ${selectedQuestions.size} questions...`, 'info');
}

// Create group
function createGroup() {
    const groupName = prompt('Enter group name:');
    if (!groupName) return;

    // In real implementation, this would call an API to create the group
    const newGroup = {
        id: 'group_' + Date.now(),
        name: groupName,
        questionIds: Array.from(selectedQuestions)
    };

    groups.push(newGroup);
    showToast(`Group "${groupName}" created with ${selectedQuestions.size} questions`, 'success');
}

// Assign to group
function assignToGroup() {
    if (selectedQuestions.size === 0) {
        showToast('Please select questions to assign to group', 'warning');
        return;
    }

    if (groups.length === 0) {
        showToast('No groups available. Please create a group first.', 'warning');
        return;
    }

    const groupNames = groups.map(g => g.name).join(', ');
    const groupName = prompt(`Available groups: ${groupNames}\nEnter group name to assign to:`);
    if (!groupName) return;

    // In real implementation, this would call an API to assign questions to group
    showToast(`Assigned ${selectedQuestions.size} questions to group "${groupName}"`, 'success');
}

// Manage groups
function manageGroups() {
    showGroupModal();
}

// Show group modal
function showGroupModal() {
    const modal = document.getElementById('groupModal');
    if (!modal) return;

    const groupsList = groups.length > 0
        ? groups.map(group => `
            <div class="p-3 border border-gray-200 rounded-lg mb-2">
                <div class="flex justify-between items-center">
                    <span class="font-semibold">${group.name}</span>
                    <span class="text-sm text-gray-500">${group.questionIds.length} questions</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">ID: ${group.id}</div>
            </div>
          `).join('')
        : '<div class="text-center text-gray-500 py-4">No groups created yet</div>';

    const modalContent = `
        <div class="space-y-4">
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">Existing Groups</h4>
                <div id="groupsList">${groupsList}</div>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-700 mb-2">Create New Group</h4>
                <div class="flex gap-2">
                    <input type="text" id="newGroupName" placeholder="Enter group name" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                    <button onclick="createNewGroupFromModal()" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        Create
                    </button>
                </div>
            </div>
            
            <div class="flex justify-end gap-3">
                <button onclick="closeGroupModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400">
                    Close
                </button>
            </div>
        </div>
    `;

    document.getElementById('groupModalContent').innerHTML = modalContent;
    modal.classList.remove('hidden');
}

// Create new group from modal
function createNewGroupFromModal() {
    const groupName = document.getElementById('newGroupName').value.trim();
    if (!groupName) {
        showToast('Please enter a group name', 'warning');
        return;
    }

    const newGroup = {
        id: 'group_' + Date.now(),
        name: groupName,
        questionIds: Array.from(selectedQuestions)
    };

    groups.push(newGroup);
    showGroupModal(); // Refresh the modal
    showToast(`Group "${groupName}" created!`, 'success');
}

// Close group modal
function closeGroupModal() {
    const modal = document.getElementById('groupModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Add new question manually
function addNewQuestion() {
    // Show the add question form in a modal
    showAddQuestionModal();
}

// Show add question modal
function showAddQuestionModal(isBulk = false) {
    const modal = document.getElementById('editModal');
    if (!modal) return;

    let formHTML;
    if (isBulk) {
        // Bulk question entry form
        formHTML = `
            <form id="bulkAddQuestionForm" onsubmit="saveBulkQuestions(event)">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Bulk Question Entry</label>
                        <p class="text-xs text-gray-500 mb-3">Enter questions in the following format:<br>
                        Q: Question text<br>
                        A: Option A<br>
                        B: Option B<br>
                        C: Option C<br>
                        D: Option D<br>
                        Correct: A<br>
                        Explanation: Explanation text<br><br>
                        
                        Separate multiple questions with blank lines.</p>
                        <textarea id="bulkQuestionsInput" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="15" placeholder="Paste your questions here in the format described above..."></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Default Subject</label>
                            <select id="bulkSubject" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="English">English</option>
                                <option value="History">History</option>
                                <option value="Geography">Geography</option>
                                <option value="Economics">Economics</option>
                                <option value="Accountancy">Accountancy</option>
                                <option value="Business Studies">Business Studies</option>
                                <option value="Political Science">Political Science</option>
                                <option value="Psychology">Psychology</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Default Academic Year</label>
                            <input type="text" id="bulkYear" value="${new Date().getFullYear()}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Default Exam Type</label>
                            <select id="bulkExamType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                <option value="Board Exam">Board Exam</option>
                                <option value="University Exam">University Exam</option>
                                <option value="Competitive Exam">Competitive Exam</option>
                                <option value="Mid-Term">Mid-Term</option>
                                <option value="Final Exam">Final Exam</option>
                                <option value="Mock Test">Mock Test</option>
                                <option value="Practice Paper">Practice Paper</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Default Difficulty Level</label>
                            <select id="bulkDifficulty" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button" onclick="closeEditModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
                            Save All Questions
                        </button>
                    </div>
                </div>
            </form>
        `;
    } else {
        // Single question entry form
        formHTML = `
            <form id="addQuestionForm" onsubmit="saveNewQuestion(event)">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Question Text</label>
                        <textarea id="addQuestionText" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3" placeholder="Enter your question text here..."></textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                            <select id="addSubject" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                <option value="Mathematics">Mathematics</option>
                                <option value="Physics">Physics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                                <option value="Computer Science">Computer Science</option>
                                <option value="English">English</option>
                                <option value="History">History</option>
                                <option value="Geography">Geography</option>
                                <option value="Economics">Economics</option>
                                <option value="Accountancy">Accountancy</option>
                                <option value="Business Studies">Business Studies</option>
                                <option value="Political Science">Political Science</option>
                                <option value="Psychology">Psychology</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                            <input type="text" id="addYear" value="${new Date().getFullYear()}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Exam Type</label>
                            <select id="addExamType" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                <option value="Board Exam">Board Exam</option>
                                <option value="University Exam">University Exam</option>
                                <option value="Competitive Exam">Competitive Exam</option>
                                <option value="Mid-Term">Mid-Term</option>
                                <option value="Final Exam">Final Exam</option>
                                <option value="Mock Test">Mock Test</option>
                                <option value="Practice Paper">Practice Paper</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Difficulty Level</label>
                            <select id="addDifficulty" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Topic/Subtopic</label>
                        <input type="text" id="addTopic" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" placeholder="e.g., Calculus, Thermodynamics, Shakespeare">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Question Options</label>
                        <div id="addOptionsContainer">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-sm font-medium">A.</span>
                                <input type="text" 
                                       id="addOption0" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                       placeholder="Option A">
                                <label class="flex items-center gap-1">
                                    <input type="radio" name="addCorrectAnswer" value="0" checked>
                                    <span class="text-sm">Correct</span>
                                </label>
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-sm font-medium">B.</span>
                                <input type="text" 
                                       id="addOption1" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                       placeholder="Option B">
                                <label class="flex items-center gap-1">
                                    <input type="radio" name="addCorrectAnswer" value="1">
                                    <span class="text-sm">Correct</span>
                                </label>
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-sm font-medium">C.</span>
                                <input type="text" 
                                       id="addOption2" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                       placeholder="Option C">
                                <label class="flex items-center gap-1">
                                    <input type="radio" name="addCorrectAnswer" value="2">
                                    <span class="text-sm">Correct</span>
                                </label>
                            </div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-sm font-medium">D.</span>
                                <input type="text" 
                                       id="addOption3" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                       placeholder="Option D">
                                <label class="flex items-center gap-1">
                                    <input type="radio" name="addCorrectAnswer" value="3">
                                    <span class="text-sm">Correct</span>
                                </label>
                            </div>
                        </div>
                        <button type="button" onclick="addOptionField('add')" class="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                            ➕ Add Option
                        </button>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Explanation</label>
                        <textarea id="addExplanation" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3" placeholder="Provide explanation for the correct answer..."></textarea>
                    </div>
                    
                    <div class="flex justify-between gap-3 pt-4">
                        <button type="button" onclick="closeEditModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all">
                            Cancel
                        </button>
                        <div class="space-x-2">
                            <button type="button" onclick="showAddQuestionModal(true)" class="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all">
                                Bulk Add
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
                                Save Question
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        `;
    }

    document.getElementById('editFormContent').innerHTML = formHTML;
    modal.classList.remove('hidden');
}

// Save new question
async function saveNewQuestion(event) {
    event.preventDefault();

    // Get form values
    const questionData = {
        question: document.getElementById('addQuestionText').value,
        subject: document.getElementById('addSubject').value,
        academicYear: document.getElementById('addYear').value,
        examType: document.getElementById('addExamType').value,
        difficulty: document.getElementById('addDifficulty').value,
        topic: document.getElementById('addTopic').value,
        explanation: document.getElementById('addExplanation').value,
        options: [],
        correctAnswer: 0
    };

    // Get options
    const optionElements = document.querySelectorAll('[id^="addOption"]');
    questionData.options = Array.from(optionElements).map(el => el.value).filter(val => val && val.trim() !== '');

    // Get correct answer
    const correctAnswerRadio = document.querySelector('input[name="addCorrectAnswer"]:checked');
    if (correctAnswerRadio) {
        questionData.correctAnswer = parseInt(correctAnswerRadio.value);
    }

    // Validate required fields
    if (!questionData.question || questionData.options.length < 2) {
        showToast('Please enter a question and at least 2 options', 'error');
        return;
    }

    try {
        const response = await fetch(API_URLS.CREATE_QUESTION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(questionData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Add to local data
            allQuestions.unshift(result.data);
            filteredQuestions = [...allQuestions];

            closeEditModal();
            renderQuestionsList();
            updateStats();
            showToast('Question added successfully!', 'success');
        } else {
            showToast(result.message || 'Failed to add question', 'error');
        }
    } catch (error) {
        console.error('Error adding question:', error);
        showToast('Error adding question: ' + error.message, 'error');
    }
}

// Save bulk questions
async function saveBulkQuestions(event) {
    event.preventDefault();

    const bulkText = document.getElementById('bulkQuestionsInput').value;
    const defaultSubject = document.getElementById('bulkSubject').value;
    const defaultYear = document.getElementById('bulkYear').value;
    const defaultExamType = document.getElementById('bulkExamType').value;
    const defaultDifficulty = document.getElementById('bulkDifficulty').value;

    if (!bulkText.trim()) {
        showToast('Please enter questions to add', 'error');
        return;
    }

    // Parse bulk questions
    const questions = parseBulkQuestions(bulkText, defaultSubject, defaultYear, defaultExamType, defaultDifficulty);

    if (questions.length === 0) {
        showToast('No valid questions found in the input', 'error');
        return;
    }

    try {
        // Send all questions in a single request
        const response = await fetch(API_URLS.CREATE_QUESTION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions: questions })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Add to local data
            allQuestions.unshift(...result.data);
            filteredQuestions = [...allQuestions];

            closeEditModal();
            renderQuestionsList();
            updateStats();
            showToast(`${result.count || questions.length} questions added successfully!`, 'success');
        } else {
            showToast(result.message || 'Failed to add questions', 'error');
        }
    } catch (error) {
        console.error('Error adding questions:', error);
        showToast('Error adding questions: ' + error.message, 'error');
    }
}

// Parse bulk questions from text
function parseBulkQuestions(text, defaultSubject, defaultYear, defaultExamType, defaultDifficulty) {
    const questionBlocks = text.split(/\n\s*\n/).filter(block => block.trim() !== '');
    const questions = [];

    for (const block of questionBlocks) {
        const lines = block.split('\n').map(line => line.trim()).filter(line => line !== '');

        let question = '';
        const options = [];
        let correctAnswer = 0;
        let explanation = '';

        for (const line of lines) {
            if (line.toLowerCase().startsWith('q:')) {
                question = line.substring(2).trim();
            } else if (/^[A-D]:/i.test(line)) {
                const optionLetter = line.charAt(0).toUpperCase();
                const optionText = line.substring(2).trim();

                // Map A->0, B->1, C->2, D->3
                const optionIndex = optionLetter.charCodeAt(0) - 'A'.charCodeAt(0);
                options[optionIndex] = optionText;
            } else if (line.toLowerCase().startsWith('correct:')) {
                const correctLetter = line.substring(8).trim().charAt(0).toUpperCase();
                correctAnswer = correctLetter.charCodeAt(0) - 'A'.charCodeAt(0);
            } else if (line.toLowerCase().startsWith('explanation:')) {
                explanation = line.substring(12).trim();
            }
        }

        // Only add if we have a question and at least 2 options
        if (question && options.filter(opt => opt !== undefined).length >= 2) {
            questions.push({
                question: question,
                options: options.filter(opt => opt !== undefined),
                correctAnswer: correctAnswer,
                subject: defaultSubject,
                academicYear: defaultYear,
                examType: defaultExamType,
                difficulty: defaultDifficulty,
                topic: '',
                explanation: explanation
            });
        }
    }

    return questions;
}

// Add option field for dynamic form
function addOptionField(prefix = 'add') {
    const container = document.getElementById(`${prefix}OptionsContainer`);
    const optionCount = container.children.length - 1; // Subtract the button
    const newIndex = optionCount;

    const optionHTML = `
        <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium">${String.fromCharCode(65 + newIndex)}.</span>
            <input type="text" 
                   id="${prefix}Option${newIndex}" 
                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                   placeholder="Option ${String.fromCharCode(65 + newIndex)}">
            <label class="flex items-center gap-1">
                <input type="radio" name="${prefix}CorrectAnswer" value="${newIndex}">
                <span class="text-sm">Correct</span>
            </label>
        </div>
    `;

    // Insert before the button
    const button = container.querySelector('button');
    if (button) {
        button.insertAdjacentHTML('beforebegin', optionHTML);
    } else {
        container.insertAdjacentHTML('beforeend', optionHTML);
    }
}


// Refresh questions
function refreshQuestions() {
    loadQuestions();
}

// Load test creator data
function loadTestCreatorData() {
    // Load subjects for test creation
    const subjectSelect = document.getElementById('testSubject');
    if (subjectSelect) {
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';

        const uniqueSubjects = new Set(allQuestions.map(q => q.subject));
        uniqueSubjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });
    }

    // Load topics for selection
    const topicSelect = document.getElementById('topicSelection');
    if (topicSelect) {
        topicSelect.innerHTML = '<option value="all">All Topics</option>';

        const uniqueTopics = new Set(allQuestions.map(q => q.topic).filter(topic => topic));
        uniqueTopics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });
    }
}

// Create test
function createTest() {
    const testTitle = document.getElementById('testTitle').value.trim();
    const testSubject = document.getElementById('testSubject').value;
    const testYear = document.getElementById('testYear').value.trim();
    const testDuration = document.getElementById('testDuration').value;
    const totalQuestions = document.getElementById('totalQuestions').value;

    if (!testTitle || !testSubject || !testYear) {
        showToast('Please fill in required fields (Title, Subject, Year)', 'error');
        return;
    }

    if (currentCreationMethod === 'manual') {
        if (testQuestions.length === 0) {
            showToast('Please add questions to the test', 'error');
            return;
        }
    } else if (currentCreationMethod === 'auto') {
        // For auto generation, we'll use the criteria to select questions
        const easyPercent = parseInt(document.getElementById('easyPercent').textContent);
        const mediumPercent = parseInt(document.getElementById('mediumPercent').textContent);
        const hardPercent = parseInt(document.getElementById('hardPercent').textContent);

        if (easyPercent + mediumPercent + hardPercent !== 100) {
            showToast('Difficulty percentages must sum to 100%', 'error');
            return;
        }
    }

    // In real implementation, this would call an API to create the test
    showToast(`Creating test: ${testTitle}`, 'info');

    // Simulate test creation
    setTimeout(() => {
        showToast(`Test "${testTitle}" created successfully!`, 'success');
    }, 1000);
}

// Preview test
function previewTest() {
    if (testQuestions.length === 0) {
        showToast('No questions in test to preview', 'warning');
        return;
    }

    // Open preview in new window
    const previewWindow = window.open('', '_blank');

    previewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Preview - ${document.getElementById('testTitle')?.value || 'Untitled Test'}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
                .question-card { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; }
                .option-item { padding: 0.75rem; margin: 0.5rem 0; border: 1px solid #e5e7eb; border-radius: 0.375rem; }
            </style>
        </head>
        <body class="min-h-screen p-8">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-3xl font-bold text-blue-600 mb-6 text-center">${document.getElementById('testTitle')?.value || 'Untitled Test'}</h1>
                
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    ${testQuestions.map((question, index) => `
                        <div class="question-card">
                            <div class="flex items-start gap-3 mb-4">
                                <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                    ${index + 1}
                                </span>
                                <div class="flex-1">
                                    <h4 class="font-semibold text-gray-800 mb-3">${question.question}</h4>
                                    
                                    <div class="space-y-2 mb-4">
                                        ${question.options.map((option, optIndex) => `
                                            <div class="option-item">
                                                <label class="flex items-center">
                                                    <input type="radio" disabled ${optIndex == question.correctAnswer ? 'checked' : ''}>
                                                    <span class="ml-2">${String.fromCharCode(65 + optIndex)}. ${option}</span>
                                                    ${optIndex == question.correctAnswer ? '<span class="ml-2 text-green-600 text-xs">✓ Correct</span>' : ''}
                                                </label>
                                            </div>
                                        `).join('')}
                                    </div>
                                    
                                    <div class="bg-blue-50 p-3 rounded-lg">
                                        <div class="font-semibold text-blue-800 mb-1">Correct Answer: ${String.fromCharCode(65 + question.correctAnswer)}</div>
                                        <div class="text-sm text-blue-700">${question.explanation || 'No explanation provided.'}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="text-sm text-gray-500">
                                Difficulty: <span class="font-semibold">${question.difficulty || 'Medium'}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `);

    previewWindow.document.close();
}

// Save test template
function saveTestTemplate() {
    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    // In real implementation, this would save the template to the database
    showToast(`Template "${templateName}" saved successfully!`, 'success');
}

// Load analytics
async function loadAnalytics() {
    try {
        const response = await fetch(API_URLS.GET_ANALYTICS);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Update statistics
            document.getElementById('analyticsTotalQuestions').textContent = result.totalQuestions || 0;
            document.getElementById('analyticsActiveTests').textContent = result.activeTests || 0;
            document.getElementById('analyticsDuplicates').textContent = result.duplicates || 0;
            document.getElementById('analyticsGroups').textContent = result.groups || 0;

            // Draw charts
            drawSubjectChart(result.subjectDistribution || {});
            drawDifficultyChart(result.difficultyDistribution || {});
        } else {
            showToast(result.message || 'Failed to load analytics', 'error');
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
        showToast('Error loading analytics: ' + error.message, 'error');
    }
}

// Draw subject chart
function drawSubjectChart(data) {
    const ctx = document.getElementById('subjectChart').getContext('2d');

    // Destroy existing chart if it exists
    if (window.subjectChart) {
        window.subjectChart.destroy();
    }

    window.subjectChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Number of Questions',
                data: Object.values(data),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Draw difficulty chart
function drawDifficultyChart(data) {
    const ctx = document.getElementById('difficultyChart').getContext('2d');

    // Destroy existing chart if it exists
    if (window.difficultyChart) {
        window.difficultyChart.destroy();
    }

    window.difficultyChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: [
                    'rgba(16, 185, 129, 0.6)',
                    'rgba(245, 158, 11, 0.6)',
                    'rgba(249, 115, 22, 0.6)',
                    'rgba(239, 68, 68, 0.6)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(249, 115, 22, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true
        }
    });
}

// ==================== EVENT LISTENERS ====================
// ==================== EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', function () {
    // Load questions when page loads
    loadQuestions();

    // Add event listeners for filter changes
    const searchInput = document.getElementById('searchQuestions');
    const subjectFilter = document.getElementById('filterSubject');
    const yearFilter = document.getElementById('filterYear');
    const difficultyFilter = document.getElementById('filterDifficulty');
    const typeFilter = document.getElementById('filterType');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (subjectFilter) subjectFilter.addEventListener('change', applyFilters);
    if (yearFilter) yearFilter.addEventListener('change', applyFilters);
    if (difficultyFilter) difficultyFilter.addEventListener('change', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
});

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');

    // Only show toast if container exists
    if (!toastContainer) {
        console.log(`${type.toUpperCase()}: ${message}`); // Fallback to console
        return;
    }

    const toast = document.createElement('div');
    toast.className = `toast-enter p-4 rounded-lg shadow-lg text-white ${type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        }`;
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// ==================== AUTHENTICATION ====================
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = '../../auth/login.html';
    }
}

// ==================== ANIMATION STYLES ====================
// Add CSS animations dynamically if they don't exist
if (!document.querySelector('#toast-animation-styles')) {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }

        .toast-enter {
            animation: slideInRight 0.3s ease-out;
        }

        .toast-exit {
            animation: slideOutRight 0.3s ease-in;
        }
    `;
    document.head.appendChild(style);
}