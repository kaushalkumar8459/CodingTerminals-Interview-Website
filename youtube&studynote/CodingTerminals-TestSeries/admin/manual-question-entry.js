// Global Variables
let questionBlocks = [];
let questionCounter = 0;
let subjects = new Set();
let years = new Set();
let examTypes = new Set();
let difficulties = new Set();
let hasInitialized = false; // Flag to prevent duplicate initialization

// API Endpoints Configuration
const API_CONFIG = {
    BASE_URL: typeof appConfig !== 'undefined' && appConfig.API_BASE_URL ? appConfig.API_BASE_URL : 'http://localhost:3000/api',
    ENDPOINTS: {
        CREATE_QUESTION: '/questions',
        CREATE_BULK_QUESTIONS: '/questions', // Same endpoint but with array of questions
        GET_ALL_QUESTIONS: '/questions'
    }
};

// Construct full API URLs
const API_URLS = {
    CREATE_QUESTION: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_QUESTION,
    CREATE_BULK_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_BULK_QUESTIONS,
    GET_ALL_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ALL_QUESTIONS
};

// Fetch existing values from the database
async function fetchExistingValues() {
    console.log('Fetching existing values from database...');

    try {
        const response = await fetch(API_URLS.GET_ALL_QUESTIONS);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('API Response:', result);

        if (result.success) {
            // Clear existing sets first
            subjects.clear();
            years.clear();
            examTypes.clear();
            difficulties.clear();

            console.log(`Processing ${result.data.length} questions...`);

            // Extract unique values from all questions
            result.data.forEach((question, index) => {
                console.log(`Processing question ${index + 1}:`, question.subject, question.academicYear, question.examType, question.difficulty);

                if (question.subject) subjects.add(question.subject);
                if (question.academicYear) years.add(question.academicYear.toString());
                if (question.examType) examTypes.add(question.examType);
                if (question.difficulty) difficulties.add(question.difficulty);
            });

            // Add common default values if not already present
            const defaultSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Accountancy', 'Business Studies', 'Political Science', 'Psychology', 'Other'];
            const defaultYears = ['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027']; // Extended year range
            const defaultExamTypes = ['Board Exam', 'University Exam', 'Competitive Exam', 'Mid-Term', 'Final Exam', 'Mock Test', 'Practice Paper'];
            const defaultDifficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

            defaultSubjects.forEach(subject => subjects.add(subject));
            defaultYears.forEach(year => years.add(year)); // Add default years
            defaultExamTypes.forEach(examType => examTypes.add(examType));
            defaultDifficulties.forEach(difficulty => difficulties.add(difficulty));

            console.log('Final data sources populated:');
            console.log('Subjects:', Array.from(subjects));
            console.log('Years:', Array.from(years));
            console.log('Exam Types:', Array.from(examTypes));
            console.log('Difficulties:', Array.from(difficulties));
        }
    } catch (error) {
        console.error('Error fetching existing values:', error);
        // Add default values in case of error
        ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Accountancy', 'Business Studies', 'Political Science', 'Psychology', 'Other'].forEach(subject => subjects.add(subject));
        ['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'].forEach(year => years.add(year)); // Default years
        ['Board Exam', 'University Exam', 'Competitive Exam', 'Mid-Term', 'Final Exam', 'Mock Test', 'Practice Paper'].forEach(examType => examTypes.add(examType));
        ['Beginner', 'Intermediate', 'Advanced', 'Expert'].forEach(difficulty => difficulties.add(difficulty));
    }
}

// Common search functionality for all input fields
function setupSearchField(inputId, suggestionsId, dataSource, placeholderText) {
    const inputElement = document.getElementById(inputId);
    const suggestionsContainer = document.getElementById(suggestionsId);

    if (!inputElement || !suggestionsContainer) {
        console.warn(`Elements not found: ${inputId} or ${suggestionsId}`);
        return;
    }

    // Set placeholder if provided
    if (placeholderText) {
        inputElement.placeholder = placeholderText;
    }

    // Input event - show suggestions as user types
    inputElement.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        showFilteredSuggestions(query, dataSource, suggestionsContainer, inputId);
    });

    // Focus event - show all suggestions when field gains focus
    inputElement.addEventListener('focus', function () {
        const query = this.value ? this.value.toLowerCase() : '';
        showFilteredSuggestions(query, dataSource, suggestionsContainer, inputId);
    });

    // Click outside - hide suggestions
    document.addEventListener('click', function (event) {
        if (!event.target.closest(`#${inputId}`) && !event.target.closest(`#${suggestionsId}`)) {
            suggestionsContainer.classList.add('hidden');
        }
    });

    console.log(`Search field setup complete for ${inputId}`);
}


function showFilteredSuggestions(query, dataSource, suggestionsContainer, inputId) {
    // Filter options based on query
    const filteredOptions = Array.from(dataSource).filter(option =>
        option.toLowerCase().includes(query.toLowerCase())
    );

    // Clear previous suggestions
    suggestionsContainer.innerHTML = '';

    if (filteredOptions.length > 0) {
        // Show matching options
        filteredOptions.forEach(option => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-4 py-2 cursor-pointer hover:bg-blue-100';
            suggestionItem.textContent = option;
            suggestionItem.onclick = function () {
                selectSuggestion(option, inputId, suggestionsContainer);
            };
            suggestionsContainer.appendChild(suggestionItem);
        });

        suggestionsContainer.classList.remove('hidden');
    } else {
        // If no matches and query is not empty, show "add new" option
        if (query.trim() !== '') {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'px-4 py-2 cursor-pointer hover:bg-blue-100 text-blue-600';
            suggestionItem.textContent = `Add "${query}" as new value`;
            suggestionItem.onclick = function () {
                selectSuggestion(query, inputId, suggestionsContainer);
            };
            suggestionsContainer.appendChild(suggestionItem);
            suggestionsContainer.classList.remove('hidden');
        } else {
            suggestionsContainer.classList.add('hidden');
        }
    }
}

// Handle selection of a suggestion
function selectSuggestion(value, inputId, suggestionsContainer) {
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
        inputElement.value = value;
        console.log(`Selected value: ${value} for ${inputId}`);
    }
    suggestionsContainer.classList.add('hidden');

    // Add to data source if it's a new value
    addToDataSource(value, inputId);
}

// Add new values to appropriate data source
function addToDataSource(value, inputId) {
    // Determine which data source to update based on input ID
    if (inputId.includes('subject') || inputId === 'defaultSubject') {
        subjects.add(value);
        console.log(`Added to subjects: ${value}`);
    } else if (inputId.includes('examType') || inputId === 'defaultExamType') {
        examTypes.add(value);
        console.log(`Added to examTypes: ${value}`);
    } else if (inputId.includes('difficulty') || inputId === 'defaultDifficulty') {
        difficulties.add(value);
        console.log(`Added to difficulties: ${value}`);
    } else if (inputId.includes('year') || inputId === 'defaultYear') {
        years.add(value);
        console.log(`Added to years: ${value}`);
    }
}

// Initialize search functionality for bulk entry options
function initSearchFields() {
    console.log('Initializing bulk search fields...');

    // Setup bulk entry search fields
    setupSearchField('defaultSubject', 'subjectSuggestions', subjects, 'Type to search or enter subject...');
    setupSearchField('defaultYear', 'yearSuggestions', years, 'Type to search or enter year...');
    setupSearchField('defaultExamType', 'examTypeSuggestions', examTypes, 'Type to search or enter exam type...');
    setupSearchField('defaultDifficulty', 'difficultySuggestions', difficulties, 'Type to search or enter difficulty...');
}

// Initialize search functionality for individual question fields
function initIndividualQuestionSearchFields(questionCounter) {
    console.log(`Initializing search fields for question ${questionCounter}`);
    console.log(`Data sources at init: subjects=${Array.from(subjects)}, examTypes=${Array.from(examTypes)}, difficulties=${Array.from(difficulties)}`);

    // Setup individual question search fields
    setupSearchField(`subject-${questionCounter}`, `subjectSuggestions-${questionCounter}`, subjects, 'Type to search or enter subject...');
    setupSearchField(`examType-${questionCounter}`, `examTypeSuggestions-${questionCounter}`, examTypes, 'Type to search or enter exam type...');
    setupSearchField(`difficulty-${questionCounter}`, `difficultySuggestions-${questionCounter}`, difficulties, 'Type to search or enter difficulty...');
}

// Add a new question block
function addQuestionBlock() {
    const container = document.getElementById('questionsContainer');
    const currentQuestionIndex = questionCounter; // Capture current index before incrementing
    const blockId = 'question-block-' + currentQuestionIndex;

    console.log(`Creating question block ${currentQuestionIndex} with ID: ${blockId}`);
    console.log(`Container element found: ${!!container}`);

    const blockHTML = `
        <div id="${blockId}" class="question-input bg-white rounded-2xl shadow-xl p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-blue-600">Question #${currentQuestionIndex + 1}</h3>
                <button type="button" onclick="removeQuestionBlock('${blockId}')" class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                    🗑️ Remove
                </button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Question Text *</label>
                    <textarea id="question-${currentQuestionIndex}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3" placeholder="Enter your question text here..."></textarea>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                        <div class="relative">
                            <input type="text" id="subject-${currentQuestionIndex}" placeholder="Type to search or enter subject..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" 
                                   autocomplete="off">
                            <div id="subjectSuggestions-${currentQuestionIndex}" class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 hidden max-h-60 overflow-y-auto">
                                <!-- Suggestions will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                        <input type="text" id="year-${currentQuestionIndex}" placeholder="e.g., 2024-2025" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Exam Type</label>
                        <div class="relative">
                            <input type="text" id="examType-${currentQuestionIndex}" placeholder="Type to search or enter exam type..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                   autocomplete="off">
                            <div id="examTypeSuggestions-${currentQuestionIndex}" class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 hidden max-h-60 overflow-y-auto">
                                <!-- Exam type suggestions will be populated here -->
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Difficulty Level</label>
                        <div class="relative">
                            <input type="text" id="difficulty-${currentQuestionIndex}" placeholder="Type to search or enter difficulty..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                   autocomplete="off">
                            <div id="difficultySuggestions-${currentQuestionIndex}" class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 hidden max-h-60 overflow-y-auto">
                                <!-- Difficulty suggestions will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Topic/Subtopic</label>
                    <input type="text" id="topic-${currentQuestionIndex}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" placeholder="e.g., Calculus, Thermodynamics, Shakespeare">
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Question Options</label>
                    <div id="options-${currentQuestionIndex}">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-medium w-8">A.</span>
                            <input type="text" 
                                   id="option-${currentQuestionIndex}-0" 
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                   placeholder="Option A">
                            <label class="flex items-center gap-1">
                                <input type="radio" name="correct-${currentQuestionIndex}" id="correct-${currentQuestionIndex}-0" value="0">
                                <span class="text-sm">Correct</span>
                            </label>
                        </div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-medium w-8">B.</span>
                            <input type="text" 
                                   id="option-${currentQuestionIndex}-1" 
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                   placeholder="Option B">
                            <label class="flex items-center gap-1">
                                <input type="radio" name="correct-${currentQuestionIndex}" id="correct-${currentQuestionIndex}-1" value="1">
                                <span class="text-sm">Correct</span>
                            </label>
                        </div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-medium w-8">C.</span>
                            <input type="text" 
                                   id="option-${currentQuestionIndex}-2" 
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                   placeholder="Option C">
                            <label class="flex items-center gap-1">
                                <input type="radio" name="correct-${currentQuestionIndex}" id="correct-${currentQuestionIndex}-2" value="2">
                                <span class="text-sm">Correct</span>
                            </label>
                        </div>
                        <div class="flex items-center gap-2 mb-2">
                            <span class="text-sm font-medium w-8">D.</span>
                            <input type="text" 
                                   id="option-${currentQuestionIndex}-3" 
                                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                                   placeholder="Option D">
                            <label class="flex items-center gap-1">
                                <input type="radio" name="correct-${currentQuestionIndex}" id="correct-${currentQuestionIndex}-3" value="3">
                                <span class="text-sm">Correct</span>
                            </label>
                        </div>
                    </div>
                    <button type="button" onclick="addOptionField(${currentQuestionIndex})" class="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                        ➕ Add Option
                    </button>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Explanation</label>
                    <textarea id="explanation-${currentQuestionIndex}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3" placeholder="Provide explanation for the correct answer..."></textarea>
                </div>
            </div>
        </div>
    `;

    console.log(`Inserting HTML for question block ${currentQuestionIndex}`);
    container.insertAdjacentHTML('beforeend', blockHTML);

    // Verify the block was added
    const addedBlock = document.getElementById(blockId);
    console.log(`Block element added: ${!!addedBlock}`);
    if (addedBlock) {
        console.log(`Block innerHTML length: ${addedBlock.innerHTML.length}`);
    }

    // Use requestAnimationFrame for better timing control
    requestAnimationFrame(() => {
        // Try multiple times with increasing delays to ensure DOM is ready
        let attempts = 0;
        const maxAttempts = 15;

        function tryInit() {
            attempts++;
            console.log(`Attempt ${attempts} to initialize search fields for question ${currentQuestionIndex}`);

            const subjectInput = document.getElementById(`subject-${currentQuestionIndex}`);
            const subjectSuggestions = document.getElementById(`subjectSuggestions-${currentQuestionIndex}`);
            const examTypeInput = document.getElementById(`examType-${currentQuestionIndex}`);
            const examTypeSuggestions = document.getElementById(`examTypeSuggestions-${currentQuestionIndex}`);
            const difficultyInput = document.getElementById(`difficulty-${currentQuestionIndex}`);
            const difficultySuggestions = document.getElementById(`difficultySuggestions-${currentQuestionIndex}`);

            console.log(`Element check results:`, {
                subjectInput: !!subjectInput,
                subjectSuggestions: !!subjectSuggestions,
                examTypeInput: !!examTypeInput,
                examTypeSuggestions: !!examTypeSuggestions,
                difficultyInput: !!difficultyInput,
                difficultySuggestions: !!difficultySuggestions
            });

            if (subjectInput && subjectSuggestions && examTypeInput && examTypeSuggestions && difficultyInput && difficultySuggestions) {
                console.log(`All elements found for question ${currentQuestionIndex}, initializing search fields...`);
                console.log(`Available data sources: subjects=${Array.from(subjects).length}, examTypes=${Array.from(examTypes).length}, difficulties=${Array.from(difficulties).length}`);
                initIndividualQuestionSearchFields(currentQuestionIndex);
            } else if (attempts < maxAttempts) {
                console.log(`Elements not found yet, retrying in ${attempts * 150}ms...`);
                setTimeout(tryInit, attempts * 150); // Increased delay
            } else {
                console.error(`Failed to find elements for question ${currentQuestionIndex} after ${maxAttempts} attempts`);
                console.log('Current DOM state:', {
                    subjectInput: !!subjectInput,
                    subjectSuggestions: !!subjectSuggestions,
                    examTypeInput: !!examTypeInput,
                    examTypeSuggestions: !!examTypeSuggestions,
                    difficultyInput: !!difficultyInput,
                    difficultySuggestions: !!difficultySuggestions
                });

                // Let's check what's actually in the DOM
                console.log('Checking DOM contents:');
                const allInputs = document.querySelectorAll('input[type="text"]');
                console.log(`Total text inputs found: ${allInputs.length}`);
                allInputs.forEach((input, index) => {
                    console.log(`Input ${index}: id=${input.id}, placeholder=${input.placeholder}`);
                });

                const allDivs = document.querySelectorAll('div[id]');
                console.log(`Total divs with IDs found: ${allDivs.length}`);
                allDivs.forEach((div, index) => {
                    if (div.id.includes('Suggestions')) {
                        console.log(`Suggestions div ${index}: id=${div.id}`);
                    }
                });
            }
        }

        tryInit();
    });

    // Increment counter AFTER setting up the initialization
    questionCounter++;
}
// Add multiple question blocks at once
function addMultipleQuestionBlocks() {
    const count = prompt('How many question blocks would you like to add?', '5');
    if (count && !isNaN(count) && count > 0) {
        for (let i = 0; i < parseInt(count); i++) {
            addQuestionBlock();
        }
    }
}

// Add option field for a specific question
function addOptionField(questionIndex) {
    const container = document.getElementById(`options-${questionIndex}`);
    const optionCount = container.children.length; // Existing options
    const newOptionIndex = optionCount;

    const optionHTML = `
        <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium w-8">${String.fromCharCode(65 + newOptionIndex)}.</span>
            <input type="text" 
                   id="option-${questionIndex}-${newOptionIndex}" 
                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                   placeholder="Option ${String.fromCharCode(65 + newOptionIndex)}">
            <label class="flex items-center gap-1">
                <input type="radio" name="correct-${questionIndex}" id="correct-${questionIndex}-${newOptionIndex}" value="${newOptionIndex}">
                <span class="text-sm">Correct</span>
            </label>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', optionHTML);
}

// Remove a question block
function removeQuestionBlock(blockId) {
    if (confirm('Are you sure you want to remove this question block?')) {
        const block = document.getElementById(blockId);
        if (block) {
            block.remove();
        }
    }
}

// Clear all question blocks
function clearAll() {
    if (confirm('Are you sure you want to clear all question blocks? This cannot be undone.')) {
        document.getElementById('questionsContainer').innerHTML = '';
        questionCounter = 0;
    }
}

// Save all questions
async function saveAllQuestions() {
    const containers = document.querySelectorAll('[id^="question-block-"]');
    const questions = [];
    let hasErrors = false;

    for (let i = 0; i < containers.length; i++) {
        const questionData = getQuestionData(i);
        if (questionData) {
            questions.push(questionData);
        } else {
            hasErrors = true;
        }
    }

    if (hasErrors) {
        showToast('Some questions have errors. Please review them.', 'error');
        return;
    }

    if (questions.length === 0) {
        showToast('No questions to save.', 'warning');
        return;
    }

    try {
        showToast(`Saving ${questions.length} questions...`, 'info');

        const response = await fetch(API_URLS.CREATE_BULK_QUESTIONS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions: questions })  // Send as array for bulk creation
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            showToast(`${result.count || questions.length} questions saved successfully!`, 'success');
            // Optionally clear the form after successful save
            // clearAll();
        } else {
            showToast(result.message || 'Failed to save questions', 'error');
        }
    } catch (error) {
        console.error('Error saving questions:', error);
        showToast('Error saving questions: ' + error.message, 'error');
    }
}

// Get question data from form
function getQuestionData(index) {
    const question = document.getElementById(`question-${index}`).value.trim();

    // Check if question is empty
    if (!question) {
        // Skip empty questions
        return null;
    }

    // Get default values
    const defaultSubject = document.getElementById('defaultSubject').value;
    const defaultYear = document.getElementById('defaultYear').value;
    const defaultExamType = document.getElementById('defaultExamType').value;
    const defaultDifficulty = document.getElementById('defaultDifficulty').value;

    // Get specific values, fallback to defaults if not specified
    const subject = document.getElementById(`subject-${index}`).value || defaultSubject;
    const academicYear = document.getElementById(`year-${index}`).value || defaultYear;
    const examType = document.getElementById(`examType-${index}`).value || defaultExamType;
    const difficulty = document.getElementById(`difficulty-${index}`).value || defaultDifficulty;

    // Get options
    const options = [];
    let optionIndex = 0;
    let optionElement;
    while ((optionElement = document.getElementById(`option-${index}-${optionIndex}`)) !== null) {
        const optionValue = optionElement.value.trim();
        if (optionValue) {
            options.push(optionValue);
        }
        optionIndex++;
    }

    // Get correct answer
    let correctAnswer = 0;
    for (let i = 0; i < options.length; i++) {
        const radio = document.getElementById(`correct-${index}-${i}`);
        if (radio && radio.checked) {
            correctAnswer = i;
            break;
        }
    }

    // Get other fields
    const topic = document.getElementById(`topic-${index}`).value;
    const explanation = document.getElementById(`explanation-${index}`).value;

    // Validate required fields
    if (options.length < 2) {
        showToast(`Question #${index + 1} needs at least 2 options.`, 'error');
        return null;
    }

    return {
        question: question,
        options: options,
        correctAnswer: correctAnswer,
        subject: subject,
        academicYear: academicYear,
        examType: examType,
        difficulty: difficulty,
        topic: topic,
        explanation: explanation
    };
}

// Show toast notification
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

// Add CSS animations for toasts
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

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = '../../auth/login.html';
    }
}

// Refresh existing values from database
async function refreshExistingValues() {
    console.log('Manually refreshing existing values...');
    showToast('Refreshing database values...', 'info');

    await fetchExistingValues();

    // Re-initialize search fields for all existing question blocks
    const containers = document.querySelectorAll('[id^="question-block-"]');
    containers.forEach((container, index) => {
        const questionIndex = index;
        console.log(`Re-initializing search fields for question ${questionIndex}`);
        initIndividualQuestionSearchFields(questionIndex);
    });

    showToast('Database values refreshed successfully!', 'success');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function () {
    // Prevent duplicate initialization
    if (hasInitialized) {
        console.log('Page already initialized, skipping...');
        return;
    }

    hasInitialized = true;
    console.log('Initializing page...');

    // Fetch existing values from the database
    await fetchExistingValues();

    // Initialize search fields
    initSearchFields();

    // Initialize with one question block
    addQuestionBlock();

    console.log('Initialization complete');
});