// File: CodingTerminals-TestSeries/viewer/practice-interface.js

// Global variables
let allQuestions = [];
let filteredQuestions = [];
let currentQuestions = [];
let currentPage = 0;
let questionsPerPage = 10;
let userAnswers = {}; // {questionId: selectedOptionIndex}
let markedForReview = new Set();
let questionStatus = {}; // {questionId: status}
let timerInterval;
let totalTimeInSeconds = 0; // Will be calculated based on number of questions
let timeRemaining = 0;
let testStarted = false;
let startTime;
let currentQuestionIndex = 0;

// API Configuration
const API_CONFIG = {
    BASE_URL: determineBaseUrl(),
    ENDPOINTS: {
        GET_ALL_QUESTIONS: APP_CONFIG.API.ENDPOINTS.QUESTIONS
    }
};
// Function to determine base URL based on environment
function determineBaseUrl() {
    // Check if we have an APP_CONFIG with API_BASE_URL defined
    if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.API.BASE_URL) {
        return APP_CONFIG.API.BASE_URL;
    }

    // Determine environment based on current hostname
    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // Local development
        return 'http://localhost:3000';
    } else {
        // Production environment - Use APP_CONFIG.BASE_URL
        return APP_CONFIG.BASE_URL;
    }
}

const API_URLS = {
    GET_ALL_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ALL_QUESTIONS
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    loadQuestions();
    loadExistingValues(); // Load existing values from database

    // Add event listeners for configuration changes to update calculated values
    document.getElementById('questionCountSelect').addEventListener('change', updateCalculatedValues);
    document.getElementById('subjectSelect').addEventListener('change', updateCalculatedValues);
    document.getElementById('yearSelect').addEventListener('change', updateCalculatedValues);
    document.getElementById('difficultySelect').addEventListener('change', updateCalculatedValues);
    document.getElementById('examTypeSelect').addEventListener('change', updateCalculatedValues);
    document.getElementById('randomSelectionCheckbox').addEventListener('change', updateCalculatedValues);
    document.getElementById('randomOrderCheckbox').addEventListener('change', updateCalculatedValues);

    // Initialize calculated values
    updateCalculatedValues();
});


// Load existing values from database for dropdowns
async function loadExistingValues() {
    try {
        const response = await fetch(API_URLS.GET_ALL_QUESTIONS);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            const subjects = new Set();
            const years = new Set();
            const difficulties = new Set();
            const examTypes = new Set();

            // Extract unique values from all questions
            result.data.forEach(question => {
                if (question.subject) subjects.add(question.subject);
                if (question.academicYear) years.add(question.academicYear.toString());
                if (question.difficulty) difficulties.add(question.difficulty);
                if (question.examType) examTypes.add(question.examType);
            });

            // Populate subject dropdown
            const subjectSelect = document.getElementById('subjectSelect');
            subjectSelect.innerHTML = '<option value="all">All Subjects</option>';
            Array.from(subjects).sort().forEach(subject => {
                const option = document.createElement('option');
                option.value = subject;
                option.textContent = subject;
                subjectSelect.appendChild(option);
            });

            // Populate year dropdown
            const yearSelect = document.getElementById('yearSelect');
            yearSelect.innerHTML = '<option value="all">All Years</option>';
            Array.from(years).sort().forEach(year => {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                yearSelect.appendChild(option);
            });

            // Populate difficulty dropdown
            const difficultySelect = document.getElementById('difficultySelect');
            difficultySelect.innerHTML = '<option value="all">All Difficulties</option>';
            Array.from(difficulties).sort().forEach(difficulty => {
                const option = document.createElement('option');
                option.value = difficulty;
                option.textContent = difficulty;
                difficultySelect.appendChild(option);
            });

            // Populate exam type dropdown
            const examTypeSelect = document.getElementById('examTypeSelect');
            examTypeSelect.innerHTML = '<option value="all">All Exam Types</option>';
            Array.from(examTypes).sort().forEach(examType => {
                const option = document.createElement('option');
                option.value = examType;
                option.textContent = examType;
                examTypeSelect.appendChild(option);
            });

            console.log(`Loaded ${subjects.size} subjects, ${years.size} years, ${difficulties.size} difficulties, and ${examTypes.size} exam types from database`);
        }
    } catch (error) {
        console.error('Error loading existing values:', error);
        // Keep default options if API fails
    }
}

// Update calculated values based on configuration
function updateCalculatedValues() {
    const questionCount = parseInt(document.getElementById('questionCountSelect').value);

    // Calculate time (1 minute per question)
    const totalMinutes = questionCount;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    document.getElementById('calculatedTime').textContent = timeString;
    document.getElementById('totalMarks').textContent = questionCount;
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
            document.getElementById('totalCount').textContent = allQuestions.length;
            initializeQuestionStatus();
        } else {
            console.error('Failed to load questions:', result.message);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Initialize question status tracking
function initializeQuestionStatus() {
    allQuestions.forEach((question, index) => {
        const questionId = question._id || question.id;
        questionStatus[questionId] = 'not-visited'; // not-visited, not-answered, answered, marked-review, answered-marked
    });
}

// Start the test - updated to include difficulty and exam type filters
function startTest() {
    const subject = document.getElementById('subjectSelect').value;
    const year = document.getElementById('yearSelect').value;
    const difficulty = document.getElementById('difficultySelect').value;
    const examType = document.getElementById('examTypeSelect').value;
    const questionCount = parseInt(document.getElementById('questionCountSelect').value);
    const randomOrder = document.getElementById('randomOrderCheckbox').checked;
    const randomSelection = document.getElementById('randomSelectionCheckbox').checked;

    // Filter questions based on selection
    let availableQuestions = allQuestions.filter(question => {
        const matchesSubject = subject === 'all' || question.subject === subject;
        const matchesYear = year === 'all' || question.academicYear == year;
        const matchesDifficulty = difficulty === 'all' || question.difficulty === difficulty;
        const matchesExamType = examType === 'all' || question.examType === examType;
        return matchesSubject && matchesYear && matchesDifficulty && matchesExamType;
    });

    if (availableQuestions.length === 0) {
        alert('No questions found for the selected criteria!');
        return;
    }

    // Apply random selection if enabled
    if (randomSelection) {
        availableQuestions = getRandomQuestions(availableQuestions, questionCount);
    } else {
        availableQuestions = availableQuestions.slice(0, Math.min(questionCount, availableQuestions.length));
    }

    // Apply random order if enabled
    if (randomOrder) {
        availableQuestions = shuffleArray([...availableQuestions]);
    }

    // Set up test
    filteredQuestions = availableQuestions;
    currentQuestionIndex = 0; // Start with first question

    // Calculate time (1 minute per question)
    totalTimeInSeconds = filteredQuestions.length * 60;
    timeRemaining = totalTimeInSeconds;
    startTime = new Date();

    // Hide config section and show question section
    document.getElementById('testConfigSection').classList.add('hidden');
    document.getElementById('questionSection').classList.remove('hidden');

    // Show test header information
    document.getElementById('testHeaderInfo').classList.remove('hidden');

    // Initialize UI
    displayCurrentQuestion();
    startTimer();

    testStarted = true;

    // Update total count display
    document.getElementById('totalCount').textContent = filteredQuestions.length;
    updateAnsweredCount();

    // Show confirmation
    showToast(`Test started with ${filteredQuestions.length} questions!`, 'success');
}


// Get random questions (simplified)
function getRandomQuestions(questions, count) {
    if (count >= questions.length) return [...questions];

    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Enhanced toast notification function
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
    toast.className = `p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full ${type === 'success' ? 'bg-green-500' :
        type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        }`;

    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Remove after delay
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

// Display current question
async function displayCurrentQuestion() {
    if (filteredQuestions.length === 0) return;

    const question = filteredQuestions[currentQuestionIndex];
    const questionId = question._id || question.id;

    // Update question header with correct question number
    document.getElementById('currentQuestionDisplay').textContent = currentQuestionIndex + 1;
    document.getElementById('questionSubject').textContent = question.subject;
    document.getElementById('questionYear').textContent = question.academicYear;
    document.getElementById('questionDifficulty').textContent = question.difficulty;

    // Update question content
    const questionContent = `
        <div class="mb-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">${question.question}</h3>
            
            <div class="space-y-3">
                ${question.options.map((option, index) => `
                    <div class="option-item ${userAnswers[questionId] === index ? 'option-selected' : ''}" 
                         onclick="selectOption('${questionId}', ${index})">
                        <label class="flex items-center cursor-pointer">
                            <input type="radio" name="question_${questionId}" value="${index}" 
                                   ${userAnswers[questionId] === index ? 'checked' : ''}
                                   class="mr-3">
                            <span class="font-medium">${String.fromCharCode(65 + index)}. ${option}</span>
                        </label>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('questionContent').innerHTML = questionContent;

    // Update mark for review button based on current question state
    updateMarkForReviewButton(questionId);

    // Update navigation buttons
    updateNavigationButtons();

    // Update pagination dots
    updatePaginationDots();

    // Update question navigator highlight
    updateQuestionNavigator();

    // Update question status to visited if not already
    if (questionStatus[questionId] === 'not-visited') {
        const isAnswered = userAnswers[questionId] !== undefined;
        const isMarked = markedForReview.has(questionId);

        if (isAnswered && isMarked) {
            questionStatus[questionId] = 'answered-marked';
        } else if (isAnswered && !isMarked) {
            questionStatus[questionId] = 'answered';
        } else if (!isAnswered && isMarked) {
            questionStatus[questionId] = 'marked-review';
        } else {
            questionStatus[questionId] = 'not-answered';
        }
    }
}


// Update mark for review button based on current question state
function updateMarkForReviewButton(questionId) {
    const markBtn = document.getElementById('markReviewBtn');

    if (markedForReview.has(questionId)) {
        // Question is marked for review
        markBtn.innerHTML = '⭐ Marked for Review';
        markBtn.className = 'px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors';
    } else {
        // Question is not marked for review
        markBtn.innerHTML = '📝 Mark for Review';
        markBtn.className = 'px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors';
    }
}
// Clear the current question's selection
function clearSelection() {
    if (!testStarted) return; // Only allow clearing during test

    const question = filteredQuestions[currentQuestionIndex];
    if (!question) return;

    const questionId = question._id || question.id;

    // Remove the user's answer for this question
    if (userAnswers[questionId] !== undefined) {
        delete userAnswers[questionId];

        // Update question status based on remaining states
        const isMarked = markedForReview.has(questionId);
        if (isMarked) {
            questionStatus[questionId] = 'marked-review';
        } else {
            questionStatus[questionId] = 'not-answered';
        }

        // Update the UI
        displayCurrentQuestion();
        updateQuestionNavigator();
        updateAnsweredCount();

        showToast('Question selection cleared!', 'info');
    } else {
        showToast('No selection to clear for this question', 'warning');
    }
}

// Select an option
function selectOption(questionId, optionIndex) {
    userAnswers[questionId] = optionIndex;

    // Update question status based on both marking and answering state
    const isMarked = markedForReview.has(questionId);
    if (isMarked) {
        questionStatus[questionId] = 'answered-marked';
    } else {
        questionStatus[questionId] = 'answered';
    }

    // Re-render the question to show selection
    displayCurrentQuestion();
    updateQuestionNavigator();
    updateAnsweredCount();
}

// Toggle mark for review
function toggleMarkForReview() {
    if (!testStarted) return; // Only allow marking during test

    const question = filteredQuestions[currentQuestionIndex];
    if (!question) return;

    const questionId = question._id || question.id;

    if (markedForReview.has(questionId)) {
        // Unmark the question
        markedForReview.delete(questionId);
        // Update button text
        document.getElementById('markReviewBtn').innerHTML = '📝 Mark for Review';
        document.getElementById('markReviewBtn').className = 'px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors';
    } else {
        // Mark the question
        markedForReview.add(questionId);
        // Update button text
        document.getElementById('markReviewBtn').innerHTML = '⭐ Marked for Review';
        document.getElementById('markReviewBtn').className = 'px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors';
    }

    // Update question status based on both marking and answering state
    const isAnswered = userAnswers[questionId] !== undefined;
    if (isAnswered && markedForReview.has(questionId)) {
        questionStatus[questionId] = 'answered-marked';
    } else if (isAnswered && !markedForReview.has(questionId)) {
        questionStatus[questionId] = 'answered';
    } else if (!isAnswered && markedForReview.has(questionId)) {
        questionStatus[questionId] = 'marked-review';
    } else {
        questionStatus[questionId] = 'not-answered';
    }

    updateQuestionNavigator();
}

// Get current question number in overall sequence
function getCurrentQuestionNumber() {
    // Find the actual position of the current displayed question
    const currentQuestion = currentQuestions[0];
    if (!currentQuestion) return 1;

    const questionId = currentQuestion._id || currentQuestion.id;

    // Find this question's position in the filtered questions array
    for (let i = 0; i < filteredQuestions.length; i++) {
        const qId = filteredQuestions[i]._id || filteredQuestions[i].id;
        if (qId === questionId) {
            return i + 1;
        }
    }

    // Fallback to page-based calculation
    return currentPage * questionsPerPage + 1;
}

// Navigate to next question
function nextQuestion() {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
        currentQuestionIndex++;
        displayCurrentQuestion();
        updateAnsweredCount();
    }
}

// Navigate to previous question
function prevQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayCurrentQuestion();
        updateAnsweredCount();
    }
}


// Update navigation buttons state
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');

    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex >= filteredQuestions.length - 1;

    // Update page numbers (show current question / total questions)
    document.getElementById('currentPage').textContent = currentQuestionIndex + 1;
    document.getElementById('totalPages').textContent = filteredQuestions.length;
}


// Update pagination dots
function updatePaginationDots() {
    const dotsContainer = document.getElementById('paginationDots');
    dotsContainer.innerHTML = '';

    // Show dots for each question
    for (let i = 0; i < filteredQuestions.length; i++) {
        const dot = document.createElement('div');
        dot.className = `dot ${i === currentQuestionIndex ? 'active' : ''}`;
        dot.onclick = () => goToQuestion(i);
        dotsContainer.appendChild(dot);
    }
}

// Update question navigator sidebar
function updateQuestionNavigator() {
    const navigatorContainer = document.getElementById('questionNavigator');
    navigatorContainer.innerHTML = '';

    filteredQuestions.forEach((question, index) => {
        const questionId = question._id || question.id;
        const status = questionStatus[questionId] || 'not-visited';

        const questionBox = document.createElement('div');
        questionBox.className = `question-number-box question-${status} ${index === currentQuestionIndex ? 'ring-2 ring-blue-500' : ''}`;
        questionBox.textContent = index + 1;
        questionBox.onclick = () => goToQuestion(index);

        navigatorContainer.appendChild(questionBox);
    });
}


// Go to specific question
function goToQuestion(questionIndex) {
    if (questionIndex >= 0 && questionIndex < filteredQuestions.length) {
        currentQuestionIndex = questionIndex;
        displayCurrentQuestion();
        updateAnsweredCount();
    }
}

// Update answered count
function updateAnsweredCount() {
    if (!testStarted) return; // Only update if test has started

    const answeredCount = Object.keys(userAnswers).filter(id =>
        filteredQuestions.some(q => (q._id || q.id) === id)
    ).length;

    document.getElementById('answeredCount').textContent = answeredCount;
}

// Start timer
function startTimer() {
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeRemaining--;

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            submitTest();
            return;
        }

        updateTimerDisplay();
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    if (!testStarted) return; // Only update if test has started

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    document.getElementById('timerDisplay').textContent = timeString;

    // Change color when time is running low
    if (timeRemaining < 300) { // Less than 5 minutes
        document.getElementById('timerDisplay').className = 'timer-display text-red-500 font-bold';
    } else if (timeRemaining < 600) { // Less than 10 minutes
        document.getElementById('timerDisplay').className = 'timer-display text-orange-500 font-bold';
    }
}

// Submit test
function submitTest() {
    if (!testStarted) return;

    clearInterval(timerInterval);

    const endTime = new Date();
    const timeTaken = Math.floor((endTime - startTime) / 1000);

    // Calculate results
    const totalQuestions = filteredQuestions.length;
    const answeredQuestions = Object.keys(userAnswers).filter(id =>
        filteredQuestions.some(q => (q._id || q.id) === id)
    ).length;
    const markedQuestions = Array.from(markedForReview).filter(id =>
        filteredQuestions.some(q => (q._id || q.id) === id)
    ).length;
    const unansweredQuestions = totalQuestions - answeredQuestions;

    // Calculate score (assuming 1 mark per correct answer)
    let score = 0;
    filteredQuestions.forEach(question => {
        const questionId = question._id || question.id;
        const userAnswer = userAnswers[questionId];
        if (userAnswer != null && question.correctAnswer != null && userAnswer === question.correctAnswer) {
            score++;
        }
    });

    const maxScore = totalQuestions;
    const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

    // Display results - with safety checks
    const resultTotal = document.getElementById('resultTotal');
    const resultAnswered = document.getElementById('resultAnswered');
    const resultMarked = document.getElementById('resultMarked');
    const resultUnanswered = document.getElementById('resultUnanswered');

    if (resultTotal) resultTotal.textContent = totalQuestions;
    if (resultAnswered) resultAnswered.textContent = answeredQuestions;
    if (resultMarked) resultMarked.textContent = markedQuestions;
    if (resultUnanswered) resultUnanswered.textContent = unansweredQuestions;

    // Only update elements that exist in the current modal
    const timeTakenEl = document.getElementById('timeTaken');
    if (timeTakenEl) {
        const hours = Math.floor(timeTaken / 3600);
        const minutes = Math.floor((timeTaken % 3600) / 60);
        const seconds = timeTaken % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeTakenEl.textContent = timeString;
    }

    // Show results modal
    const resultsModal = document.getElementById('resultsModal');
    if (resultsModal) {
        resultsModal.classList.remove('hidden');
    }
}

// Review answers
function reviewAnswers() {
    // Close the results modal
    document.getElementById('resultsModal').classList.add('hidden');

    // Hide the question section
    document.getElementById('questionSection').classList.add('hidden');

    // Generate review content
    const reviewContent = generateReviewContent();

    // Create the review interface
    const reviewHTML = `
        <div class="bg-white rounded-2xl shadow-xl p-8">
            <div class="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
                <h2 class="text-2xl font-bold text-gray-800">Answer Review - All Questions</h2>
                <div class="flex gap-3">
                    <button onclick="restartTest()" class="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all">
                        🔄 Restart Test
                    </button>
                    <button onclick="closeReview()" class="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all">
                        Close Review
                    </button>
                </div>
            </div>
            
            <div id="reviewContent" class="space-y-6">
                ${reviewContent}
            </div>
        </div>
    `;

    // Replace the question section with the review interface
    document.getElementById('questionSection').innerHTML = reviewHTML;
    document.getElementById('questionSection').classList.remove('hidden');
}
// Generate review content for all questions
function generateReviewContent() {
    let content = '';

    filteredQuestions.forEach((question, index) => {
        const questionId = question._id || question.id;
        const userAnswerIndex = userAnswers[questionId];
        const isCorrect = userAnswerIndex != null && question.correctAnswer != null &&
            userAnswerIndex === question.correctAnswer;
        const isAnswered = userAnswerIndex != null;

        const userAnswerText = isAnswered ?
            `${String.fromCharCode(65 + userAnswerIndex)}. ${question.options[userAnswerIndex]}` :
            'Not answered';

        const correctAnswerText = question.correctAnswer != null ?
            `${String.fromCharCode(65 + question.correctAnswer)}. ${question.options[question.correctAnswer]}` :
            'No correct answer provided';

        content += `
        <div class="border border-gray-200 rounded-xl p-6 mb-6">
            <div class="flex justify-between items-start mb-4">
                <h4 class="text-lg font-bold text-gray-800">Question ${index + 1}: ${question.subject} (${question.difficulty})</h4>
                <span class="px-3 py-1 rounded-full text-sm font-semibold ${isAnswered ?
                (isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') :
                'bg-yellow-100 text-yellow-800'
            }">
                    ${isAnswered ? (isCorrect ? 'Correct ✓' : 'Incorrect ✗') : 'Not Answered'}
                </span>
            </div>
            
            <p class="text-gray-700 mb-4">${question.question}</p>
            
            <div class="space-y-3 mb-4">
                ${question.options.map((option, optIndex) => {
                let optionClass = 'p-3 rounded-lg bg-gray-100';

                // Highlight user's selection
                if (userAnswerIndex === optIndex) {
                    if (isCorrect) {
                        optionClass = 'p-3 rounded-lg bg-green-100 border border-green-300';
                    } else {
                        optionClass = 'p-3 rounded-lg bg-red-100 border border-red-300';
                    }
                }
                // Highlight correct answer
                else if (question.correctAnswer === optIndex) {
                    optionClass = 'p-3 rounded-lg bg-green-100 border border-green-300';
                }

                return `
                    <div class="${optionClass}">
                        <label class="flex items-center">
                            <input type="radio" disabled ${userAnswerIndex === optIndex ? 'checked' : ''} class="mr-3">
                            <span class="font-medium">${String.fromCharCode(65 + optIndex)}. ${option}</span>
                        </label>
                    </div>
                    `;
            }).join('')}
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div>
                    <p class="text-sm font-semibold text-blue-800">Your Answer: <span class="${isAnswered ? (isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold') : 'text-gray-600'}">${userAnswerText}</span></p>
                </div>
                <div>
                    <p class="text-sm font-semibold text-blue-800">Correct Answer: <span class="text-green-600 font-bold">${correctAnswerText}</span></p>
                </div>
            </div>
            
            ${question.explanation ? `
            <div class="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <p class="text-sm font-semibold text-green-800">Explanation:</p>
                <p class="text-gray-700">${question.explanation}</p>
            </div>
            ` : ''}
        </div>
        `;
    });

    return content;
}

// Close review and return to question navigator
function closeReview() {
    // Hide the question section (which now contains review)
    document.getElementById('questionSection').classList.add('hidden');

    // Show the test config section
    document.getElementById('testConfigSection').classList.remove('hidden');

    // Reset test state
    testStarted = false;
    clearInterval(timerInterval);

    // Reset UI
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('timerDisplay').className = 'timer-display';
    document.getElementById('answeredCount').textContent = '0';
    document.getElementById('totalCount').textContent = allQuestions.length;
    document.getElementById('testHeaderInfo').classList.add('hidden');
}

// Restart test
function restartTest() {
    // Reset all variables
    currentPage = 0;
    currentQuestionIndex = 0;
    userAnswers = {};
    markedForReview = new Set();
    questionStatus = {};
    timeRemaining = totalTimeInSeconds;
    testStarted = false;

    clearInterval(timerInterval);

    // Reset UI
    document.getElementById('testConfigSection').classList.remove('hidden');
    document.getElementById('questionSection').classList.add('hidden');
    document.getElementById('testHeaderInfo').classList.add('hidden'); // Hide header info
    document.getElementById('resultsModal').classList.add('hidden');

    // Reset timer display
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('timerDisplay').className = 'timer-display';

    // Reload questions
    loadQuestions();

    // Recalculate values
    updateCalculatedValues();
}

// Close results modal
function closeResults() {
    document.getElementById('resultsModal').classList.add('hidden');
}

// Handle window before unload
window.addEventListener('beforeunload', function (e) {
    if (testStarted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your test progress will be lost.';
    }
});