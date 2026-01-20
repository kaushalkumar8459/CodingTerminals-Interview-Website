// File: CodingTerminals-TestSeries/viewer/practice-interface.js

// Global Variables
let allQuestions = [];
let practiceQuestions = [];
let mockTestQuestions = [];
let currentPracticeQuestionIndex = -1;
let currentMockQuestionIndex = -1;
let userAnswers = {};
let mockUserAnswers = {};
let practiceMode = 'subject';
let mockTestActive = false;
let mockTestStartTime = null;
let mockTestDuration = 0;
let mockTestInterval = null;
let userProgress = {
    questionsAttempted: 0,
    questionsCorrect: 0,
    weakAreas: [],
    totalTimeSpent: 0
};
let currentTab = 'practice';

// API Endpoints Configuration
const API_CONFIG = {
    BASE_URL: typeof appConfig !== 'undefined' && appConfig.API_BASE_URL ? appConfig.API_BASE_URL : 'http://localhost:3000/api',
    ENDPOINTS: {
        GET_ALL_QUESTIONS: '/questions',
        GET_QUESTIONS_BY_SUBJECT: '/questions/subject/',
        GET_QUESTIONS_BY_YEAR: '/questions/year/',
        GET_USER_PROGRESS: '/users/progress',
        SAVE_USER_ANSWER: '/users/answers',
        GET_WEAK_AREAS: '/questions/progress/user',
        SAVE_PROGRESS: '/questions/progress/user'
    }
};

// Construct full API URLs
const API_URLS = {
    GET_ALL_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ALL_QUESTIONS,
    GET_QUESTIONS_BY_SUBJECT: (subject) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_QUESTIONS_BY_SUBJECT + subject,
    GET_QUESTIONS_BY_YEAR: (year) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_QUESTIONS_BY_YEAR + year,
    GET_USER_PROGRESS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_USER_PROGRESS,
    SAVE_USER_ANSWER: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SAVE_USER_ANSWER,
    GET_WEAK_AREAS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_WEAK_AREAS,
    SAVE_PROGRESS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SAVE_PROGRESS
};

// Switch between practice tabs
function switchPracticeTab(tabName) {
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
    if (tabName === 'progress') {
        loadProgressData();
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
            
            // Populate filters
            populateFilters();
        } else {
            console.error('Failed to load questions:', result.message);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Populate filters with unique values
function populateFilters() {
    const practiceSubjectFilter = document.getElementById('practiceSubjectFilter');
    const practiceYearFilter = document.getElementById('practiceYearFilter');
    const mockSubjectFilter = document.getElementById('mockSubjectFilter');
    const mockYearFilter = document.getElementById('mockYearFilter');
    const mockDifficultyFilter = document.getElementById('mockDifficultyFilter');
    
    if (!practiceSubjectFilter || !practiceYearFilter || !mockSubjectFilter || !mockYearFilter || !mockDifficultyFilter) return;
    
    // Get unique values
    const uniqueSubjects = new Set();
    const uniqueYears = new Set();
    const uniqueDifficulties = new Set();
    
    allQuestions.forEach(question => {
        if (question.subject) uniqueSubjects.add(question.subject);
        if (question.academicYear) uniqueYears.add(question.academicYear);
        if (question.difficulty) uniqueDifficulties.add(question.difficulty);
    });
    
    // Populate practice filters
    uniqueSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        practiceSubjectFilter.appendChild(option);
        mockSubjectFilter.appendChild(option.cloneNode(true));
    });
    
    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        practiceYearFilter.appendChild(option);
        mockYearFilter.appendChild(option.cloneNode(true));
    });
    
    uniqueDifficulties.forEach(difficulty => {
        const option = document.createElement('option');
        option.value = difficulty.toLowerCase();
        option.textContent = difficulty;
        mockDifficultyFilter.appendChild(option);
    });
}

// Start practice session
function startPracticeSession() {
    const mode = document.getElementById('practiceModeSelect').value;
    const subjectFilter = document.getElementById('practiceSubjectFilter').value;
    const yearFilter = document.getElementById('practiceYearFilter').value;
    const difficultyFilter = document.getElementById('practiceDifficultyFilter').value;
    
    // Filter questions based on mode and filters
    let filteredQuestions = allQuestions.filter(question => {
        let matches = true;
        
        if (subjectFilter !== 'all' && question.subject !== subjectFilter) {
            matches = false;
        }
        
        if (yearFilter !== 'all' && question.academicYear !== yearFilter) {
            matches = false;
        }
        
        if (difficultyFilter !== 'all' && question.difficulty.toLowerCase() !== difficultyFilter) {
            matches = false;
        }
        
        return matches;
    });
    
    // Apply mode-specific filtering
    if (mode === 'random') {
        // Shuffle questions
        filteredQuestions = [...filteredQuestions].sort(() => 0.5 - Math.random());
    } else if (mode === 'weak') {
        // Filter by weak areas if any exist
        if (userProgress.weakAreas && userProgress.weakAreas.length > 0) {
            filteredQuestions = filteredQuestions.filter(q => 
                userProgress.weakAreas.includes(q.subject) || 
                userProgress.weakAreas.includes(q.topic)
            );
        }
    }
    
    practiceQuestions = filteredQuestions;
    currentPracticeQuestionIndex = 0;
    userAnswers = {};
    
    if (practiceQuestions.length === 0) {
        showToast('No questions available with current filters', 'warning');
        return;
    }
    
    updatePracticeProgress();
    showCurrentPracticeQuestion();
    showToast(`Starting practice session with ${practiceQuestions.length} questions`, 'success');
}

// Show current practice question
function showCurrentPracticeQuestion() {
    if (currentPracticeQuestionIndex < 0 || currentPracticeQuestionIndex >= practiceQuestions.length) {
        endPracticeSession();
        return;
    }
    
    const question = practiceQuestions[currentPracticeQuestionIndex];
    const container = document.getElementById('questionDisplayContainer');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-xl font-bold text-blue-600 mb-2">${question.subject}</h2>
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
                            <span>🎯</span>
                            <strong>Topic:</strong> ${question.topic}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="question-content text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="text-lg font-semibold mb-3">${question.question}</h3>
                
                <div class="space-y-2">
                    ${question.options.map((option, optIndex) => {
                        const userAnswer = userAnswers[question.id];
                        const isSelected = userAnswer !== undefined && userAnswer === optIndex;
                        const isCorrect = question.correctAnswer === optIndex;
                        const showResult = userAnswer !== undefined;
                        
                        return `
                            <div class="option-item ${isSelected ? 'option-selected' : ''} ${showResult && isCorrect ? 'option-correct' : ''} ${showResult && !isCorrect ? 'option-incorrect' : ''}" 
                                 onclick="selectPracticeOption(${currentPracticeQuestionIndex}, ${optIndex})">
                                <label class="flex items-center cursor-pointer">
                                    <input type="radio" 
                                           name="practice_question_${question.id}" 
                                           value="${optIndex}" 
                                           class="mr-3"
                                           ${isSelected ? 'checked' : ''}
                                           onchange="selectPracticeOption(${currentPracticeQuestionIndex}, ${optIndex})">
                                    <span>${String.fromCharCode(65 + optIndex)}. ${option}</span>
                                    ${showResult && isCorrect ? '<span class="ml-2 text-green-600 text-sm">✓ Correct</span>' : ''}
                                    ${showResult && !isCorrect && isSelected ? '<span class="ml-2 text-red-600 text-sm">✗ Incorrect</span>' : ''}
                                </label>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            ${question.explanation ? `
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div class="font-semibold text-blue-800 mb-2">Explanation:</div>
                    <div class="text-blue-700">${question.explanation}</div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Enable/disable navigation buttons
    document.getElementById('prevBtn').disabled = currentPracticeQuestionIndex === 0;
    document.getElementById('nextBtn').disabled = currentPracticeQuestionIndex === practiceQuestions.length - 1;
    
    updatePracticeProgress();
}

// Select practice option
function selectPracticeOption(questionIndex, optionIndex) {
    if (mockTestActive) return; // Don't allow changes during mock test
    
    const questionId = practiceQuestions[questionIndex].id;
    userAnswers[questionId] = optionIndex;
    
    // Show result immediately
    showCurrentPracticeQuestion();
    
    // Save answer to backend
    saveUserAnswer(questionId, optionIndex);
}

// Update practice progress
function updatePracticeProgress() {
    const currentNum = document.getElementById('currentQuestionNum');
    const totalNum = document.getElementById('totalQuestionsNum');
    const progressFill = document.getElementById('practiceProgressFill');
    
    if (currentNum) currentNum.textContent = currentPracticeQuestionIndex + 1;
    if (totalNum) totalNum.textContent = practiceQuestions.length;
    
    if (progressFill && practiceQuestions.length > 0) {
        const percentage = ((currentPracticeQuestionIndex + 1) / practiceQuestions.length) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

// Navigation functions
function prevQuestion() {
    if (currentPracticeQuestionIndex > 0) {
        currentPracticeQuestionIndex--;
        showCurrentPracticeQuestion();
    }
}

function nextQuestion() {
    if (currentPracticeQuestionIndex < practiceQuestions.length - 1) {
        currentPracticeQuestionIndex++;
        showCurrentPracticeQuestion();
    }
}

function skipQuestion() {
    if (currentPracticeQuestionIndex < practiceQuestions.length - 1) {
        currentPracticeQuestionIndex++;
        showCurrentPracticeQuestion();
    } else {
        endPracticeSession();
    }
}

// End practice session
function endPracticeSession() {
    calculateResults();
}

// Calculate results
function calculateResults() {
    let correctAnswers = 0;
    const results = practiceQuestions.map((question, index) => {
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
    
    const score = Math.round((correctAnswers / practiceQuestions.length) * 100);
    
    // Update user progress
    userProgress.questionsAttempted += practiceQuestions.length;
    userProgress.questionsCorrect += correctAnswers;
    
    // Identify weak areas
    identifyWeakAreas(results);
    
    // Show results
    showResults(score, correctAnswers, practiceQuestions.length, results);
}

// Show results
function showResults(score, correct, total, results) {
    const container = document.getElementById('resultsModal');
    const content = document.getElementById('resultsContent');
    
    if (!container || !content) return;
    
    content.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-4">${score >= 60 ? '🎉' : '👍'}</div>
            <h3 class="text-3xl font-bold ${score >= 60 ? 'text-green-600' : 'text-blue-600'} mb-2">
                ${score >= 60 ? 'Great Job!' : 'Keep Practicing!'}
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

// Close results modal
function closeResultsModal() {
    const container = document.getElementById('resultsModal');
    if (container) {
        container.classList.add('hidden');
    }
}

// Restart practice
function restartPractice() {
    closeResultsModal();
    startPracticeSession();
}

// Review questions
function reviewQuestions() {
    closeResultsModal();
    
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
                    ${practiceQuestions.map((question, index) => {
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

// Start mock test
function startMockTest() {
    const testTitle = document.getElementById('mockTestTitle').value || 'Mock Test';
    const duration = parseInt(document.getElementById('mockTestDuration').value) || 60;
    const numQuestions = parseInt(document.getElementById('mockTestQuestions').value) || 20;
    const subjectFilter = document.getElementById('mockSubjectFilter').value;
    const yearFilter = document.getElementById('mockYearFilter').value;
    const difficultyFilter = document.getElementById('mockDifficultyFilter').value;
    
    // Filter questions
    let filteredQuestions = allQuestions.filter(question => {
        let matches = true;
        
        if (subjectFilter !== 'all' && question.subject !== subjectFilter) {
            matches = false;
        }
        
        if (yearFilter !== 'all' && question.academicYear !== yearFilter) {
            matches = false;
        }
        
        if (difficultyFilter !== 'all' && question.difficulty.toLowerCase() !== difficultyFilter) {
            matches = false;
        }
        
        return matches;
    });
    
    // Limit to specified number of questions
    if (filteredQuestions.length > numQuestions) {
        filteredQuestions = [...filteredQuestions].sort(() => 0.5 - Math.random()).slice(0, numQuestions);
    }
    
    if (filteredQuestions.length === 0) {
        showToast('No questions available with current filters', 'warning');
        return;
    }
    
    mockTestQuestions = filteredQuestions;
    currentMockQuestionIndex = 0;
    mockUserAnswers = {};
    mockTestActive = true;
    mockTestDuration = duration * 60; // Convert to seconds
    mockTestStartTime = new Date();
    
    // Update UI
    document.getElementById('mockTestTitleDisplay').textContent = testTitle;
    document.getElementById('mockCurrentQuestionNum').textContent = '1';
    document.getElementById('mockTotalQuestionsNum').textContent = mockTestQuestions.length;
    document.getElementById('endTestBtn').classList.remove('hidden');
    
    // Start timer
    startMockTimer();
    
    // Show first question
    showCurrentMockQuestion();
    
    showToast(`Starting mock test: ${testTitle} (${duration} minutes)`, 'success');
}

// Show current mock question
function showCurrentMockQuestion() {
    if (currentMockQuestionIndex < 0 || currentMockQuestionIndex >= mockTestQuestions.length) {
        endMockTest();
        return;
    }
    
    const question = mockTestQuestions[currentMockQuestionIndex];
    const container = document.getElementById('mockQuestionDisplayContainer');
    
    if (!container) return;
    
    container.innerHTML = `
        <div class="mb-6">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h2 class="text-xl font-bold text-purple-600 mb-2">${question.subject}</h2>
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
                            <span>🎯</span>
                            <strong>Topic:</strong> ${question.topic}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="question-content text-gray-700 mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="text-lg font-semibold mb-3">${question.question}</h3>
                
                <div class="space-y-2">
                    ${question.options.map((option, optIndex) => {
                        const userAnswer = mockUserAnswers[question.id];
                        const isSelected = userAnswer !== undefined && userAnswer === optIndex;
                        
                        return `
                            <div class="option-item ${isSelected ? 'option-selected' : ''}" 
                                 onclick="selectMockOption(${currentMockQuestionIndex}, ${optIndex})">
                                <label class="flex items-center cursor-pointer">
                                    <input type="radio" 
                                           name="mock_question_${question.id}" 
                                           value="${optIndex}" 
                                           class="mr-3"
                                           ${isSelected ? 'checked' : ''}
                                           onchange="selectMockOption(${currentMockQuestionIndex}, ${optIndex})">
                                    <span>${String.fromCharCode(65 + optIndex)}. ${option}</span>
                                </label>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            
            ${question.explanation ? `
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div class="font-semibold text-purple-800 mb-2">Explanation:</div>
                    <div class="text-purple-700">${question.explanation}</div>
                </div>
            ` : ''}
        </div>
    `;
    
    // Update navigation
    document.getElementById('mockCurrentQuestionNum').textContent = currentMockQuestionIndex + 1;
    document.getElementById('mockPrevBtn').disabled = currentMockQuestionIndex === 0;
    document.getElementById('mockNextBtn').disabled = currentMockQuestionIndex === mockTestQuestions.length - 1;
    
    // Update progress
    const progressFill = document.getElementById('mockProgressFill');
    if (progressFill && mockTestQuestions.length > 0) {
        const percentage = ((currentMockQuestionIndex + 1) / mockTestQuestions.length) * 100;
        progressFill.style.width = `${percentage}%`;
    }
}

// Select mock option
function selectMockOption(questionIndex, optionIndex) {
    if (!mockTestActive) return;
    
    const questionId = mockTestQuestions[questionIndex].id;
    mockUserAnswers[questionId] = optionIndex;
    
    // Show selected state
    showCurrentMockQuestion();
    
    // Save answer to backend
    saveUserAnswer(questionId, optionIndex);
}

// Start mock timer
function startMockTimer() {
    const timerDisplay = document.getElementById('mockTimer');
    if (!timerDisplay) return;
    
    clearInterval(mockTestInterval);
    
    mockTestInterval = setInterval(() => {
        if (!mockTestActive) return;
        
        const now = new Date();
        const elapsed = Math.floor((now - mockTestStartTime) / 1000);
        const remaining = Math.max(0, mockTestDuration - elapsed);
        
        if (remaining <= 0) {
            clearInterval(mockTestInterval);
            endMockTest();
            return;
        }
        
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const seconds = remaining % 60;
        
        timerDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Navigation functions for mock test
function mockPrevQuestion() {
    if (currentMockQuestionIndex > 0) {
        currentMockQuestionIndex--;
        showCurrentMockQuestion();
    }
}

function mockNextQuestion() {
    if (currentMockQuestionIndex < mockTestQuestions.length - 1) {
        currentMockQuestionIndex++;
        showCurrentMockQuestion();
    }
}

function markForReview() {
    showToast('Question marked for review', 'info');
}

// End mock test
function endMockTest() {
    mockTestActive = false;
    clearInterval(mockTestInterval);
    document.getElementById('endTestBtn').classList.add('hidden');
    
    // Calculate results
    let correctAnswers = 0;
    const results = mockTestQuestions.map((question, index) => {
        const questionId = question.id;
        const userAnswer = mockUserAnswers[questionId];
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
    
    const score = Math.round((correctAnswers / mockTestQuestions.length) * 100);
    
    // Update user progress
    userProgress.questionsAttempted += mockTestQuestions.length;
    userProgress.questionsCorrect += correctAnswers;
    
    // Identify weak areas
    identifyWeakAreas(results);
    
    // Show results
    showResults(score, correctAnswers, mockTestQuestions.length, results);
}

// Review mock test
function reviewMockTest() {
    if (mockTestQuestions.length === 0) {
        showToast('No mock test questions to review', 'warning');
        return;
    }
    
    // Open review in new window
    const reviewWindow = window.open('', '_blank');
    
    reviewWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mock Test Review - Coding Terminals</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                body { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
                .question-card { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 1.5rem; margin-bottom: 1rem; }
                .option-item { padding: 0.75rem; margin: 0.5rem 0; border: 1px solid #e5e7eb; border-radius: 0.375rem; }
            </style>
        </head>
        <body class="min-h-screen p-8">
            <div class="max-w-4xl mx-auto">
                <h1 class="text-3xl font-bold text-purple-600 mb-6 text-center">Mock Test Review</h1>
                
                <div class="bg-white rounded-2xl shadow-xl p-8">
                    ${mockTestQuestions.map((question, index) => {
                        const questionId = question.id;
                        const userAnswer = mockUserAnswers[questionId];
                        const isCorrect = userAnswer !== undefined && userAnswer == question.correctAnswer;
                        
                        return `
                            <div class="question-card">
                                <div class="flex items-start gap-3 mb-4">
                                    <span class="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
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
                                        
                                        <div class="bg-purple-50 p-3 rounded-lg">
                                            <div class="font-semibold text-purple-800 mb-1">Correct Answer: ${String.fromCharCode(65 + question.correctAnswer)}</div>
                                            <div class="text-sm text-purple-700">${question.explanation || 'No explanation provided.'}</div>
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

// Shuffle questions for random practice
function shuffleQuestions() {
    if (practiceQuestions.length > 0) {
        practiceQuestions = [...practiceQuestions].sort(() => 0.5 - Math.random());
        currentPracticeQuestionIndex = 0;
        showCurrentPracticeQuestion();
        showToast('Questions shuffled successfully', 'success');
    }
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset your progress?')) {
        userProgress = {
            questionsAttempted: 0,
            questionsCorrect: 0,
            weakAreas: [],
            totalTimeSpent: 0
        };
        
        // Update UI
        updateWeakAreasList();
        showToast('Progress reset successfully', 'success');
    }
}

// Identify weak areas
function identifyWeakAreas(results) {
    const incorrectBySubject = {};
    const incorrectByTopic = {};
    
    results.forEach(result => {
        const question = allQuestions.find(q => q.id === result.questionId);
        if (question && !result.isCorrect) {
            // Count by subject
            if (incorrectBySubject[question.subject]) {
                incorrectBySubject[question.subject]++;
            } else {
                incorrectBySubject[question.subject] = 1;
            }
            
            // Count by topic
            if (question.topic) {
                if (incorrectByTopic[question.topic]) {
                    incorrectByTopic[question.topic]++;
                } else {
                    incorrectByTopic[question.topic] = 1;
                }
            }
        }
    });
    
    // Identify weak areas (subjects/topics with high error rates)
    const weakAreas = [];
    
    // Add subjects with more than 3 incorrect answers
    for (const [subject, count] of Object.entries(incorrectBySubject)) {
        if (count > 3) {
            weakAreas.push(subject);
        }
    }
    
    // Add topics with more than 2 incorrect answers
    for (const [topic, count] of Object.entries(incorrectByTopic)) {
        if (count > 2 && !weakAreas.includes(topic)) {
            weakAreas.push(topic);
        }
    }
    
    userProgress.weakAreas = weakAreas;
    updateWeakAreasList();
}

// Update weak areas list
function updateWeakAreasList() {
    const list = document.getElementById('weakAreasList');
    if (!list) return;
    
    if (userProgress.weakAreas.length > 0) {
        list.innerHTML = userProgress.weakAreas.map(area => `
            <div class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm mb-1">
                ${area}
            </div>
        `).join('');
    } else {
        list.innerHTML = '<div class="text-sm text-gray-500">No weak areas identified yet</div>';
    }
}

// Load progress data
async function loadProgressData() {
    try {
        const response = await fetch(API_URLS.GET_USER_PROGRESS);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            userProgress = result.data || userProgress;
            
            // Update UI elements
            document.getElementById('overallScore').textContent = 
                userProgress.questionsAttempted > 0 
                    ? Math.round((userProgress.questionsCorrect / userProgress.questionsAttempted) * 100) + '%' 
                    : '0%';
            document.getElementById('questionsAttempted').textContent = userProgress.questionsAttempted;
            document.getElementById('weakAreasCount').textContent = userProgress.weakAreas.length;
            
            // Convert seconds to hours and minutes
            const hours = Math.floor(userProgress.totalTimeSpent / 3600);
            const minutes = Math.floor((userProgress.totalTimeSpent % 3600) / 60);
            document.getElementById('studyTime').textContent = `${hours}h ${minutes}m`;
            
            // Update weak areas list
            updateWeakAreasList();
            
            // Draw charts
            drawSubjectPerformanceChart();
            drawProgressChart();
        }
    } catch (error) {
        console.error('Error loading progress data:', error);
    }
}

// Draw subject performance chart
function drawSubjectPerformanceChart() {
    const ctx = document.getElementById('subjectPerformanceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.subjectPerformanceChart) {
        window.subjectPerformanceChart.destroy();
    }
    
    // Sample data - in real implementation, this would come from API
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
    const scores = [85, 72, 90, 68]; // Sample scores
    
    window.subjectPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects,
            datasets: [{
                label: 'Performance (%)',
                data: scores,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Draw progress chart
function drawProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.progressChart) {
        window.progressChart.destroy();
    }
    
    // Sample data - in real implementation, this would come from API
    const dates = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const scores = [65, 70, 75, 80, 85, 90]; // Sample scores over time
    
    window.progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Performance (%)',
                data: scores,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
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

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
    updateWeakAreasList();
});

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(toastContainer);
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