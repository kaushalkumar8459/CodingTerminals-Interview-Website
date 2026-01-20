// File: CodingTerminals-TestSeries/viewer/question-practice.js

// Global Variables
let allQuestions = [];
let filteredQuestions = [];
let currentDisplayQuestionIndex = null;
let practiceMode = 'browse'; // browse, practice, mock
let userAnswers = {};
let startTime = null;
let timerInterval = null;
let testDuration = 0; // in seconds
let uniqueSubjects = new Set();
let uniqueYears = new Set();
let uniqueDifficulties = new Set();
let currentTestQuestions = [];
let currentTestIndex = 0;
let isTimerPaused = false;

// API Endpoints Configuration
const API_CONFIG = {
    BASE_URL: typeof appConfig !== 'undefined' && appConfig.API_BASE_URL ? appConfig.API_BASE_URL : 'http://localhost:3000/api',
    ENDPOINTS: {
        GET_ALL_QUESTIONS: '/questions',
        GET_QUESTIONS_BY_SUBJECT: '/questions/subject/',
        GET_QUESTIONS_BY_YEAR: '/questions/year/',
        GET_QUESTIONS_BY_DIFFICULTY: '/questions/difficulty/',
        SUBMIT_ANSWERS: '/questions/submit',
        GET_USER_PROGRESS: '/users/progress',
        SAVE_USER_ANSWER: '/users/answers'
    }
};

// Construct full API URLs
const API_URLS = {
    GET_ALL_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ALL_QUESTIONS,
    GET_QUESTIONS_BY_SUBJECT: (subject) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_QUESTIONS_BY_SUBJECT + subject,
    GET_QUESTIONS_BY_YEAR: (year) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_QUESTIONS_BY_YEAR + year,
    GET_QUESTIONS_BY_DIFFICULTY: (difficulty) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_QUESTIONS_BY_DIFFICULTY + difficulty,
    SUBMIT_ANSWERS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SUBMIT_ANSWERS,
    GET_USER_PROGRESS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_USER_PROGRESS,
    SAVE_USER_ANSWER: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SAVE_USER_ANSWER
};

// ==================== INITIALIZATION ====================
window.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
});

// ==================== DATA LOADING ====================
async function loadQuestions() {
    try {
        showLoading(true);
        
        // Fetch questions from API
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
            updateSearchResultsInfo();
            showToast('📚 Questions loaded successfully!', 'success');
        } else {
            showToast(result.message || 'Failed to load questions', 'error');
            // Fallback to empty arrays
            allQuestions = [];
            filteredQuestions = [];
            renderQuestionsList();
            renderFilters();
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('❌ Error loading questions: ' + error.message, 'error');
        renderQuestionsList();
        renderFilters();
    } finally {
        showLoading(false);
    }
}

// Extract unique values for filters
function extractUniqueValues() {
    uniqueSubjects = new Set();
    uniqueYears = new Set();
    uniqueDifficulties = new Set();
    
    allQuestions.forEach(question => {
        if (question.subject) uniqueSubjects.add(question.subject);
        if (question.academicYear) uniqueYears.add(question.academicYear);
        if (question.difficulty) uniqueDifficulties.add(question.difficulty);
    });
}

// Render filter dropdowns
function renderFilters() {
    const subjectFilter = document.getElementById('subjectFilter');
    const yearFilter = document.getElementById('yearFilter');
    const difficultyFilter = document.getElementById('difficultyFilter');
    
    if (!subjectFilter || !yearFilter || !difficultyFilter) return;
    
    // Clear existing options except "All"
    subjectFilter.innerHTML = '<option value="all">📚 All Subjects</option>';
    yearFilter.innerHTML = '<option value="all">📅 All Years</option>';
    difficultyFilter.innerHTML = '<option value="all">⭐ All Difficulties</option>';
    
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

// ==================== SEARCH AND FILTERING ====================
function handleSearch() {
    applyFilters();
    updateSearchResultsInfo();
}

function handleSubjectFilter() {
    applyFilters();
    updateSearchResultsInfo();
}

function handleYearFilter() {
    applyFilters();
    updateSearchResultsInfo();
}

function handleDifficultyFilter() {
    applyFilters();
    updateSearchResultsInfo();
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value?.toLowerCase() || '';
    const subjectFilter = document.getElementById('subjectFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    
    filteredQuestions = allQuestions.filter(question => {
        const matchesSearch = !searchTerm || 
                             question.question.toLowerCase().includes(searchTerm) ||
                             question.subject.toLowerCase().includes(searchTerm) ||
                             question.topic.toLowerCase().includes(searchTerm) ||
                             question.explanation.toLowerCase().includes(searchTerm);
        
        const matchesSubject = subjectFilter === 'all' || question.subject === subjectFilter;
        const matchesYear = yearFilter === 'all' || question.academicYear === yearFilter;
        const matchesDifficulty = difficultyFilter === 'all' || question.difficulty === difficultyFilter;
        
        return matchesSearch && matchesSubject && matchesYear && matchesDifficulty;
    });
    
    renderQuestionsList();
    updateSidebarCounts();
}

function updateSearchResultsInfo() {
    const searchResultsInfo = document.getElementById('searchResultsInfo');
    if (!searchResultsInfo) return;
    
    const totalQuestions = allQuestions.length;
    const filteredCount = filteredQuestions.length;
    
    if (filteredCount !== totalQuestions) {
        searchResultsInfo.textContent = `${filteredCount} of ${totalQuestions} questions shown`;
    } else {
        searchResultsInfo.textContent = `${totalQuestions} questions available`;
    }
}

function updateSidebarCounts() {
    const sidebarCount = document.getElementById('sidebarQuestionCount');
    if (sidebarCount) {
        sidebarCount.textContent = `(${filteredQuestions.length})`;
    }
}

// ==================== QUESTIONS LIST MANAGEMENT ====================
function renderQuestionsList() {
    const container = document.getElementById('questionsListContainer');
    const countElement = document.getElementById('sidebarQuestionCount');
    
    if (!container || !countElement) return;
    
    countElement.textContent = `(${filteredQuestions.length})`;
    
    if (filteredQuestions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400">
                <div class="text-4xl mb-2">📚</div>
                <p class="text-sm">No questions found</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredQuestions.map((question, index) => `
        <div onclick="selectQuestion(${index})" 
             class="p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 bg-blue-50 border-blue-200 hover:bg-blue-100 hover:border-blue-300 hover:shadow-md">
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate text-blue-900">
                        ${question.question.substring(0, 60)}${question.question.length > 60 ? '...' : ''}
                    </div>
                    <div class="text-xs mt-1 flex items-center gap-2 text-blue-600">
                        <span>📚</span>
                        <span>${question.subject}</span>
                    </div>
                    <div class="text-xs mt-1 flex items-center gap-2 text-blue-600">
                        <span>📅</span>
                        <span>${question.academicYear}</span>
                    </div>
                    <div class="text-xs mt-1 flex items-center gap-2 text-blue-600">
                        <span>⭐</span>
                        <span>${question.difficulty}</span>
                    </div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ${question.marks} mark${question.marks !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== QUESTION DISPLAY ====================
function selectQuestion(index) {
    const question = filteredQuestions[index];
    
    if (!question) {
        showToast('❌ Question not found', 'error');
        return;
    }
    
    currentDisplayQuestionIndex = index;
    renderQuestionDisplay(question);
}

function renderQuestionDisplay(question) {
    const container = document.getElementById('questionDisplayContainer');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-2xl font-bold text-blue-600 mb-2">${question.subject}</h2>
                    <div class="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span class="flex items-center gap-1">
                            <span>📅</span>
                            <strong>Year:</strong> ${question.academicYear}
                        </span>
                        <span class="flex items-center gap-1">
                            <span>⭐</span>
                            <strong>Difficulty:</strong> ${question.difficulty}
                        </span>
                        <span class="flex items-center gap-1">
                            <span>📝</span>
                            <strong>Type:</strong> ${question.examType}
                        </span>
                        <span class="flex items-center gap-1">
                            <span>🎯</span>
                            <strong>Topic:</strong> ${question.topic}
                        </span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="showQuestionInNewTab(${currentDisplayQuestionIndex})" class="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors">
                        📖 View Full
                    </button>
                </div>
            </div>
            
            <div class="question-content text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="text-lg font-semibold mb-3">${question.question}</h3>
                
                <div class="space-y-2">
                    ${question.options.map((option, optIndex) => `
                        <div class="option-item" onclick="selectOption(${currentDisplayQuestionIndex}, ${optIndex})">
                            <label class="flex items-center cursor-pointer">
                                <input type="radio" 
                                       name="question_${currentDisplayQuestionIndex}" 
                                       value="${optIndex}" 
                                       class="mr-3"
                                       onchange="selectOption(${currentDisplayQuestionIndex}, ${optIndex})">
                                <span>${String.fromCharCode(65 + optIndex)}. ${option}</span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div class="font-semibold text-blue-800 mb-2">Explanation:</div>
                <div class="text-blue-700">${question.explanation || 'No explanation available.'}</div>
            </div>
        </div>
    `;
}

// Select option for current question
function selectOption(questionIndex, optionIndex) {
    const questionId = filteredQuestions[questionIndex]?.id;
    if (!questionId) return;
    
    userAnswers[questionId] = optionIndex;
    
    // Update UI to show selected option
    const options = document.querySelectorAll(`input[name="question_${questionIndex}"]`);
    options.forEach(opt => {
        const optionItem = opt.parentElement.parentElement;
        optionItem.classList.toggle('option-selected', opt.value == optionIndex);
    });
    
    // Save user answer to backend
    saveUserAnswer(questionId, optionIndex);
}

// Save user answer to backend
async function saveUserAnswer(questionId, answerIndex) {
    try {
        const response = await fetch(API_URLS.SAVE_USER_ANSWER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questionId: questionId,
                answerIndex: answerIndex,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            console.warn('Failed to save user answer:', response.status);
        }
    } catch (error) {
        console.warn('Error saving user answer:', error);
    }
}

// ==================== PRACTICE MODES ====================
function changePracticeMode() {
    const modeSelect = document.getElementById('practiceMode');
    if (!modeSelect) return;
    
    practiceMode = modeSelect.value;
    
    const controls = document.getElementById('practiceControls');
    const progressContainer = document.getElementById('progressContainer');
    const timerContainer = document.getElementById('timerContainer');
    
    if (practiceMode !== 'browse') {
        controls?.classList.remove('hidden');
        progressContainer?.classList.remove('hidden');
        
        if (practiceMode === 'mock') {
            timerContainer?.classList.remove('hidden');
        } else {
            timerContainer?.classList.add('hidden');
        }
    } else {
        controls?.classList.add('hidden');
        progressContainer?.classList.add('hidden');
        timerContainer?.classList.add('hidden');
    }
}

function startPracticeSession() {
    if (filteredQuestions.length === 0) {
        showToast('No questions available for practice', 'warning');
        return;
    }
    
    currentTestQuestions = [...filteredQuestions];
    currentTestIndex = 0;
    userAnswers = {};
    
    updateProgressDisplay();
    showToast('Practice session started!', 'success');
    selectQuestion(currentTestIndex);
}

function startMockTest() {
    if (filteredQuestions.length === 0) {
        showToast('No questions available for mock test', 'warning');
        return;
    }
    
    // Shuffle questions for mock test
    currentTestQuestions = [...filteredQuestions].sort(() => 0.5 - Math.random());
    currentTestIndex = 0;
    userAnswers = {};
    
    // Set default test duration (e.g., 60 minutes per 100 questions)
    testDuration = Math.min(300, Math.ceil(currentTestQuestions.length * 0.6)) * 60; // Convert to seconds
    
    updateProgressDisplay();
    startTimer();
    showToast('Mock test started!', 'success');
    selectQuestion(currentTestIndex);
}

// ==================== TIMER FUNCTIONS ====================
function startTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    if (!timerDisplay) return;
    
    startTime = new Date();
    isTimerPaused = false;
    
    timerInterval = setInterval(() => {
        if (isTimerPaused) return;
        
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = Math.max(0, testDuration - elapsed);
        
        if (remaining <= 0) {
            clearInterval(timerInterval);
            endTestSession();
            return;
        }
        
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        
        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function pauseResumeTimer() {
    isTimerPaused = !isTimerPaused;
    const button = document.querySelector('#timerContainer button');
    if (button) {
        button.textContent = isTimerPaused ? '▶️ Resume' : '⏸️ Pause';
    }
}

// ==================== PROGRESS FUNCTIONS ====================
function updateProgressDisplay() {
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const currentNum = document.getElementById('currentQuestionNum');
    const totalNum = document.getElementById('totalQuestionsNum');
    
    if (!progressContainer || !progressFill || !currentNum || !totalNum) return;
    
    const total = currentTestQuestions.length;
    const current = currentTestIndex + 1;
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    progressFill.style.width = `${percentage}%`;
    currentNum.textContent = current;
    totalNum.textContent = total;
}

// ==================== TEST SESSION MANAGEMENT ====================
function endTestSession() {
    // Calculate results
    let correctAnswers = 0;
    const results = currentTestQuestions.map((question, index) => {
        const questionId = question.id;
        const userAnswer = userAnswers[questionId];
        const isCorrect = userAnswer !== undefined && userAnswer == question.correctAnswer;
        
        if (isCorrect) correctAnswers++;
        
        return {
            questionId: questionId,
            questionText: question.question,
            userAnswer: userAnswer,
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            explanation: question.explanation
        };
    });
    
    const score = Math.round((correctAnswers / currentTestQuestions.length) * 100);
    
    // Show results
    showResults(score, correctAnswers, currentTestQuestions.length, results);
    
    // Stop timer
    clearInterval(timerInterval);
}

function showResults(score, correct, total, results) {
    const container = document.getElementById('resultsModal');
    const content = document.getElementById('resultsContent');
    
    if (!container || !content) return;
    
    content.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-4">${score >= 60 ? '🎉' : '👍'}</div>
            <h3 class="text-3xl font-bold ${score >= 60 ? 'text-green-600' : 'text-blue-600'} mb-2">
                ${score >= 60 ? 'Passed!' : 'Keep Practicing!'}
            </h3>
            <div class="text-2xl font-bold text-gray-800 mb-2">${score}%</div>
            <div class="text-lg text-gray-600 mb-6">
                ${correct} out of ${total} questions correct
            </div>
            <div class="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <div class="bg-green-100 text-green-800 p-3 rounded-lg">
                    <div class="text-2xl font-bold">${correct}</div>
                    <div>Correct</div>
                </div>
                <div class="bg-red-100 text-red-800 p-3 rounded-lg">
                    <div class="text-2xl font-bold">${total - correct}</div>
                    <div>Incorrect</div>
                </div>
            </div>
        </div>
    `;
    
    container.classList.remove('hidden');
}

function closeResultsModal() {
    const container = document.getElementById('resultsModal');
    if (container) {
        container.classList.add('hidden');
    }
}

function restartPractice() {
    closeResultsModal();
    
    if (practiceMode === 'mock') {
        startMockTest();
    } else {
        startPracticeSession();
    }
}

function reviewQuestions() {
    // Open review in new window
    const reviewWindow = window.open('', '_blank');
    
    reviewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Question Review - Coding Terminals</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
                .question-card { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; }
                .option-item { padding: 0.75rem; margin: 0.5rem 0; border: 1px solid #e5e7eb; border-radius: 0.375rem; }
            </style>
        </head>
        <body class="min-h-screen p-8">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-3xl font-bold text-blue-600 mb-6 text-center">Question Review</h1>
                
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    ${currentTestQuestions.map((question, index) => {
                        const questionId = question.id;
                        const userAnswer = userAnswers[questionId];
                        const isCorrect = userAnswer !== undefined && userAnswer == question.correctAnswer;
                        
                        return `
                            <div class="question-card">
                                <div class="flex items-start gap-3 mb-4">
                                    <span class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                        ${index + 1}
                                    </span>
                                    <div class="flex-1">
                                        <h4 class="font-semibold text-gray-800 mb-3">${question.question}</h4>
                                        
                                        <div class="space-y-2 mb-4">
                                            ${question.options.map((option, optIndex) => `
                                                <div class="option-item ${
                                                    optIndex == question.correctAnswer 
                                                        ? 'bg-green-100 border-green-500 text-green-800' 
                                                        : (userAnswer === optIndex && !isCorrect)
                                                            ? 'bg-red-100 border-red-500 text-red-800'
                                                            : 'bg-gray-50 border-gray-300'
                                                }">
                                                    <label class="flex items-center">
                                                        <input type="radio" 
                                                               disabled 
                                                               ${optIndex == question.correctAnswer ? 'checked' : ''}
                                                               ${(userAnswer === optIndex && !isCorrect) ? 'checked' : ''}>
                                                        <span class="ml-2">${String.fromCharCode(65 + optIndex)}. ${option}</span>
                                                        ${optIndex == question.correctAnswer ? '<span class="ml-2 text-green-600 text-xs">✓ Correct</span>' : ''}
                                                        ${(userAnswer === optIndex && !isCorrect) ? '<span class="ml-2 text-red-600 text-xs">✗ Your Answer</span>' : ''}
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
                        `;
                    }).join('')}
                </div>
            </div>
        </body>
        </html>
    `);
    
    reviewWindow.document.close();
}

function showQuestionInNewTab(index) {
    const question = filteredQuestions[index];
    if (!question) return;
    
    const questionWindow = window.open('', '_blank');
    
    questionWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${question.question.substring(0, 50)}... - Question Detail</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
                .question-card { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; }
                .option-item { padding: 0.75rem; margin: 0.5rem 0; border: 1px solid #e5e7eb; border-radius: 0.375rem; }
            </style>
        </head>
        <body class="min-h-screen p-8">
            <div class="max-w-3xl mx-auto">
                <h1 class="text-2xl font-bold text-blue-600 mb-6 text-center">Question Detail</h1>
                
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    <div class="question-card">
                        <h3 class="text-xl font-semibold text-gray-800 mb-4">${question.question}</h3>
                        
                        <div class="flex flex-wrap gap-2 mb-4">
                            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${question.subject}</span>
                            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">${question.academicYear}</span>
                            <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">${question.examType}</span>
                            <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">${question.difficulty}</span>
                        </div>
                        
                        <div class="space-y-2 mb-4">
                            ${question.options.map((option, optIndex) => `
                                <div class="option-item">
                                    <label class="flex items-center">
                                        <input type="radio" disabled ${optIndex == question.correctAnswer ? 'checked' : ''}>
                                        <span class="ml-2">${String.fromCharCode(65 + optIndex)}. ${option}</span>
                                        ${optIndex == question.correctAnswer ? '<span class="ml-2 text-green-600 text-sm">✓ Correct</span>' : ''}
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div class="font-semibold text-blue-800 mb-2">Explanation:</div>
                            <div class="text-blue-700">${question.explanation || 'No explanation provided.'}</div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    
    questionWindow.document.close();
}

// ==================== UTILITY FUNCTIONS ====================
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    // Only show toast if container exists
    if (!toastContainer) {
        console.log(`${type.toUpperCase()}: ${message}`); // Fallback to console
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast-enter p-4 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' :
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