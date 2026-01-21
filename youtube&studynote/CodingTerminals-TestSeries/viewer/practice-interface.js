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
let totalTimeInSeconds = 3600; // 60 minutes default
let timeRemaining = 3600;
let testStarted = false;
let startTime;

// API Configuration
const API_CONFIG = {
    BASE_URL: typeof appConfig !== 'undefined' && appConfig.API_BASE_URL ? appConfig.API_BASE_URL : 'http://localhost:3000/api',
    ENDPOINTS: {
        GET_ALL_QUESTIONS: '/questions'
    }
};

const API_URLS = {
    GET_ALL_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ALL_QUESTIONS
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    loadQuestions();
});

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

// Start the test
function startTest() {
    const subject = document.getElementById('subjectSelect').value;
    const year = document.getElementById('yearSelect').value;
    const duration = parseInt(document.getElementById('durationSelect').value);
    const questionCount = parseInt(document.getElementById('questionCountSelect').value);
    const randomOrder = document.getElementById('randomOrderCheckbox').checked;
    const randomSelection = document.getElementById('randomSelectionCheckbox').checked;
    const difficultyMix = document.getElementById('difficultyMixSelect').value;

    // Filter questions based on selection
    let availableQuestions = allQuestions.filter(question => {
        const matchesSubject = subject === 'all' || question.subject === subject;
        const matchesYear = year === 'all' || question.academicYear == year;
        return matchesSubject && matchesYear;
    });

    if (availableQuestions.length === 0) {
        alert('No questions found for the selected criteria!');
        return;
    }

    // Apply random selection if enabled
    if (randomSelection) {
        availableQuestions = getRandomQuestions(availableQuestions, questionCount, difficultyMix);
    } else {
        // Take first N questions (or all if less than requested)
        availableQuestions = availableQuestions.slice(0, Math.min(questionCount, availableQuestions.length));
    }

    // Apply random order if enabled
    if (randomOrder) {
        availableQuestions = shuffleArray([...availableQuestions]);
    }

    // Set up pagination
    filteredQuestions = availableQuestions;
    currentQuestions = filteredQuestions.slice(0, questionsPerPage);
    totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);

    // Set timer
    totalTimeInSeconds = duration * 60;
    timeRemaining = totalTimeInSeconds;
    startTime = new Date();

    // Hide config section and show question section
    document.getElementById('testConfigSection').classList.add('hidden');
    document.getElementById('questionSection').classList.remove('hidden');

    // Initialize UI
    updateQuestionNavigator();
    displayCurrentQuestion();
    startTimer();

    testStarted = true;

    // Update total count display
    document.getElementById('totalCount').textContent = filteredQuestions.length;
    updateAnsweredCount();

    // Show confirmation
    showToast(`Test started with ${filteredQuestions.length} questions!`, 'success');
}

// Get random questions with difficulty distribution
function getRandomQuestions(questions, count, difficultyMix) {
    // Define difficulty distributions
    const distributions = {
        balanced: { easy: 0.3, medium: 0.5, hard: 0.2 },
        easy: { easy: 0.5, medium: 0.3, hard: 0.2 },
        medium: { easy: 0.2, medium: 0.6, hard: 0.2 },
        hard: { easy: 0.2, medium: 0.3, hard: 0.5 },
        random: null // Will use equal distribution
    };

    const dist = distributions[difficultyMix];
    let selectedQuestions = [];

    if (dist) {
        // Apply specific difficulty distribution
        const easyQuestions = questions.filter(q => q.difficulty?.toLowerCase() === 'beginner' || q.difficulty?.toLowerCase() === 'easy');
        const mediumQuestions = questions.filter(q => q.difficulty?.toLowerCase() === 'intermediate' || q.difficulty?.toLowerCase() === 'medium');
        const hardQuestions = questions.filter(q => q.difficulty?.toLowerCase() === 'advanced' || q.difficulty?.toLowerCase() === 'hard' || q.difficulty?.toLowerCase() === 'expert');

        // Calculate counts for each difficulty
        const easyCount = Math.floor(count * dist.easy);
        const mediumCount = Math.floor(count * dist.medium);
        const hardCount = count - easyCount - mediumCount; // Remaining goes to hard

        // Select random questions from each category
        selectedQuestions = [
            ...getRandomSubset(easyQuestions, easyCount),
            ...getRandomSubset(mediumQuestions, mediumCount),
            ...getRandomSubset(hardQuestions, hardCount)
        ];
    } else {
        // Random distribution - just pick random questions
        selectedQuestions = getRandomSubset(questions, count);
    }

    return selectedQuestions;
}

// Get random subset of array
function getRandomSubset(array, count) {
    if (count >= array.length) return [...array];

    const shuffled = [...array].sort(() => 0.5 - Math.random());
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
function displayCurrentQuestion() {
    if (currentQuestions.length === 0) return;

    const question = currentQuestions[0]; // We show one question at a time
    const questionId = question._id || question.id;

    // Update question header
    document.getElementById('currentQuestionDisplay').textContent = getCurrentQuestionNumber();
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

    // Update navigation buttons
    updateNavigationButtons();

    // Update pagination dots
    updatePaginationDots();

    // Update question status to visited
    if (questionStatus[questionId] === 'not-visited') {
        questionStatus[questionId] = userAnswers[questionId] !== undefined ? 'answered' : 'not-answered';
        updateQuestionNavigator();
    }
}

// Get current question number in overall sequence
function getCurrentQuestionNumber() {
    return currentPage * questionsPerPage + 1;
}

// Select an option
function selectOption(questionId, optionIndex) {
    userAnswers[questionId] = optionIndex;

    // Update question status
    const isMarked = markedForReview.has(questionId);
    questionStatus[questionId] = isMarked ? 'answered-marked' : 'answered';

    // Re-render the question to show selection
    displayCurrentQuestion();
    updateQuestionNavigator();
    updateAnsweredCount();
}

// Toggle mark for review
function toggleMarkForReview() {
    const question = currentQuestions[0];
    if (!question) return;

    const questionId = question._id || question.id;

    if (markedForReview.has(questionId)) {
        markedForReview.delete(questionId);
        // Update button text
        document.getElementById('markReviewBtn').innerHTML = '📝 Mark for Review';
        document.getElementById('markReviewBtn').className = 'px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors';
    } else {
        markedForReview.add(questionId);
        // Update button text
        document.getElementById('markReviewBtn').innerHTML = '⭐ Marked for Review';
        document.getElementById('markReviewBtn').className = 'px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors';
    }

    // Update question status
    const isAnswered = userAnswers[questionId] !== undefined;
    questionStatus[questionId] = isAnswered ? 'answered-marked' : 'marked-review';

    updateQuestionNavigator();
}

// Navigate to next question
function nextQuestion() {
    if (currentPage < Math.ceil(filteredQuestions.length / questionsPerPage) - 1) {
        currentPage++;
        currentQuestions = filteredQuestions.slice(
            currentPage * questionsPerPage,
            (currentPage + 1) * questionsPerPage
        );
        displayCurrentQuestion();
    }
}

// Navigate to previous question
function prevQuestion() {
    if (currentPage > 0) {
        currentPage--;
        currentQuestions = filteredQuestions.slice(
            currentPage * questionsPerPage,
            (currentPage + 1) * questionsPerPage
        );
        displayCurrentQuestion();
    }
}

// Update navigation buttons state
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prevQuestionBtn');
    const nextBtn = document.getElementById('nextQuestionBtn');

    prevBtn.disabled = currentPage === 0;
    nextBtn.disabled = currentPage >= Math.ceil(filteredQuestions.length / questionsPerPage) - 1;

    // Update page numbers
    document.getElementById('currentPage').textContent = currentPage + 1;
    document.getElementById('totalPages').textContent = Math.ceil(filteredQuestions.length / questionsPerPage);
}

// Update pagination dots
function updatePaginationDots() {
    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
    const dotsContainer = document.getElementById('paginationDots');

    dotsContainer.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('div');
        dot.className = `dot ${i === currentPage ? 'active' : ''}`;
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
        questionBox.className = `question-number-box question-${status}`;
        questionBox.textContent = index + 1;
        questionBox.onclick = () => goToQuestion(index);

        navigatorContainer.appendChild(questionBox);
    });
}

// Go to specific question
function goToQuestion(questionIndex) {
    currentPage = Math.floor(questionIndex / questionsPerPage);
    currentQuestions = filteredQuestions.slice(
        currentPage * questionsPerPage,
        (currentPage + 1) * questionsPerPage
    );

    // Set the specific question as current
    const localIndex = questionIndex % questionsPerPage;
    if (localIndex < currentQuestions.length) {
        const temp = currentQuestions[0];
        currentQuestions[0] = currentQuestions[localIndex];
        currentQuestions[localIndex] = temp;
    }

    displayCurrentQuestion();
}

// Update answered count
function updateAnsweredCount() {
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

    // Display results
    document.getElementById('resultTotal').textContent = totalQuestions;
    document.getElementById('resultAnswered').textContent = answeredQuestions;
    document.getElementById('resultMarked').textContent = markedQuestions;
    document.getElementById('resultUnanswered').textContent = unansweredQuestions;

    const hours = Math.floor(timeTaken / 3600);
    const minutes = Math.floor((timeTaken % 3600) / 60);
    const seconds = timeTaken % 60;
    document.getElementById('timeTaken').textContent =
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Show results modal
    document.getElementById('resultsModal').classList.remove('hidden');
}

// Review answers
function reviewAnswers() {
    // This would show detailed review of all questions and answers
    alert('Review functionality would be implemented here');
    closeResults();
}

// Restart test
function restartTest() {
    // Reset all variables
    currentPage = 0;
    userAnswers = {};
    markedForReview = new Set();
    questionStatus = {};
    timeRemaining = totalTimeInSeconds;
    testStarted = false;

    clearInterval(timerInterval);

    // Reset UI
    document.getElementById('testConfigSection').classList.remove('hidden');
    document.getElementById('questionSection').classList.add('hidden');
    document.getElementById('resultsModal').classList.add('hidden');

    // Reload questions
    loadQuestions();
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