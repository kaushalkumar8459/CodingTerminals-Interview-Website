// File: CodingTerminals-TestSeries/admin/manual-question-entry.js
// Note: Common utilities (sanitizeHTML, destroyQuillEditor, showToast, fullToolbarOptions, etc.) are loaded from shared/utils.js

// Form persistence key
const FORM_STORAGE_KEY = 'manualQuestionEntryFormData';

// Global Variables
let questionBlocks = [];
let questionCounter = 0;
let subjects = new Set();
let years = new Set();
let examTypes = new Set();
let difficulties = new Set();
let hasInitialized = false;

// Store Quill editor instances for each question block
let questionEditors = {}; // {questionIndex: {question: Quill, explanation: Quill, options: [Quill, ...]}}

// API Endpoints Configuration
const API_CONFIG = {
    BASE_URL: determineBaseUrl(),
    ENDPOINTS: {
        CREATE_QUESTION: APP_CONFIG.API.ENDPOINTS.QUESTIONS,
        CREATE_BULK_QUESTIONS: APP_CONFIG.API.ENDPOINTS.QUESTIONS,
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

// Construct full API URLs
const API_URLS = {
    CREATE_QUESTION: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_QUESTION,
    CREATE_BULK_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_BULK_QUESTIONS,
    GET_ALL_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ALL_QUESTIONS
};

// Fetch existing values from the database
async function fetchExistingValues() {
    try {
        const response = await fetch(API_URLS.GET_ALL_QUESTIONS);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // Clear existing sets first
            subjects.clear();
            years.clear();
            examTypes.clear();
            difficulties.clear();

            // Extract unique values from all questions
            result.data.forEach(question => {
                if (question.subject) subjects.add(question.subject);
                if (question.academicYear) years.add(question.academicYear.toString());
                if (question.examType) examTypes.add(question.examType);
                if (question.difficulty) difficulties.add(question.difficulty);
            });

            // Add common default values
            const defaultSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Accountancy', 'Business Studies', 'Political Science', 'Psychology', 'Other'];
            const defaultYears = ['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'];
            const defaultExamTypes = ['Board Exam', 'University Exam', 'Competitive Exam', 'Mid-Term', 'Final Exam', 'Mock Test', 'Practice Paper'];
            const defaultDifficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

            defaultSubjects.forEach(subject => subjects.add(subject));
            defaultYears.forEach(year => years.add(year));
            defaultExamTypes.forEach(examType => examTypes.add(examType));
            defaultDifficulties.forEach(difficulty => difficulties.add(difficulty));
        }
    } catch (error) {
        console.error('Error fetching existing values:', error);
        // Add default values in case of error
        ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Accountancy', 'Business Studies', 'Political Science', 'Psychology', 'Other'].forEach(subject => subjects.add(subject));
        ['2020-2021', '2021-2022', '2022-2023', '2023-2024', '2024-2025', '2025-2026', '2026-2027'].forEach(year => years.add(year));
        ['Board Exam', 'University Exam', 'Competitive Exam', 'Mid-Term', 'Final Exam', 'Mock Test', 'Practice Paper'].forEach(examType => examTypes.add(examType));
        ['Beginner', 'Intermediate', 'Advanced', 'Expert'].forEach(difficulty => difficulties.add(difficulty));
    }
}

// Common search functionality for all input fields
function setupSearchField(inputId, suggestionsId, dataSource, placeholderText) {
    const inputElement = document.getElementById(inputId);
    const suggestionsContainer = document.getElementById(suggestionsId);

    if (!inputElement || !suggestionsContainer) {
        return;
    }

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
}

// Show filtered suggestions based on query
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
    }
    suggestionsContainer.classList.add('hidden');

    // Add to data source if it's a new value
    addToDataSource(value, inputId);
}

// Add new values to appropriate data source
function addToDataSource(value, inputId) {
    if (inputId.includes('subject') || inputId === 'defaultSubject') {
        subjects.add(value);
    } else if (inputId.includes('examType') || inputId === 'defaultExamType') {
        examTypes.add(value);
    } else if (inputId.includes('difficulty') || inputId === 'defaultDifficulty') {
        difficulties.add(value);
    } else if (inputId.includes('year') || inputId === 'defaultYear') {
        years.add(value);
    }
}

// Initialize search functionality for bulk entry options
function initSearchFields() {
    setupSearchField('defaultSubject', 'subjectSuggestions', subjects, 'Type to search or enter subject...');
    setupSearchField('defaultYear', 'yearSuggestions', years, 'Type to search or enter year...');
    setupSearchField('defaultExamType', 'examTypeSuggestions', examTypes, 'Type to search or enter exam type...');
    setupSearchField('defaultDifficulty', 'difficultySuggestions', difficulties, 'Type to search or enter difficulty...');
}

// Initialize search functionality for individual question fields
function initIndividualQuestionSearchFields(questionCounter) {
    setupSearchField(`subject-${questionCounter}`, `subjectSuggestions-${questionCounter}`, subjects, 'Type to search or enter subject...');
    setupSearchField(`examType-${questionCounter}`, `examTypeSuggestions-${questionCounter}`, examTypes, 'Type to search or enter exam type...');
    setupSearchField(`difficulty-${questionCounter}`, `difficultySuggestions-${questionCounter}`, difficulties, 'Type to search or enter difficulty...');
}

// Add a new question block
function addQuestionBlock() {
    const container = document.getElementById('questionsContainer');
    const currentQuestionIndex = questionCounter;
    const blockId = 'question-block-' + currentQuestionIndex;

    const blockHTML = `
        <div id="${blockId}" class="question-input bg-white rounded-2xl shadow-xl p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold text-blue-600">Question #${currentQuestionIndex + 1}</h3>
                <button type="button" onclick="removeQuestionBlock('${blockId}', ${currentQuestionIndex})" class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm">
                    🗑️ Remove
                </button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Question Text *</label>
                    <div id="question-editor-${currentQuestionIndex}" class="bg-white border border-gray-300 rounded-lg" style="min-height: 100px;"></div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                        <div class="relative">
                            <input type="text" id="subject-${currentQuestionIndex}" placeholder="Type to search or enter subject..." 
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" 
                                   autocomplete="off">
                            <div id="subjectSuggestions-${currentQuestionIndex}" class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 hidden max-h-60 overflow-y-auto">
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
                    <div id="options-${currentQuestionIndex}" class="space-y-3">
                        <div class="option-editor-container p-3 bg-gray-50 rounded-lg" data-option-index="0">
                            <div class="flex items-center justify-between gap-3 mb-2">
                                <div class="flex items-center gap-3">
                                    <span class="option-letter text-lg font-bold text-blue-600 min-w-[24px]">A.</span>
                                    <label class="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-300 cursor-pointer hover:bg-green-50 transition-colors">
                                        <input type="radio" name="correct-${currentQuestionIndex}" id="correct-${currentQuestionIndex}-0" value="0" class="w-4 h-4 text-green-600">
                                        <span class="text-sm text-gray-600">Correct Answer</span>
                                    </label>
                                </div>
                                <button type="button" onclick="removeOptionField(${currentQuestionIndex}, this)" class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition-colors" title="Remove option">
                                    🗑️
                                </button>
                            </div>
                            <div id="option-editor-${currentQuestionIndex}-0" class="bg-white border border-gray-300 rounded-lg" style="min-height: 50px;"></div>
                        </div>
                        <div class="option-editor-container p-3 bg-gray-50 rounded-lg" data-option-index="1">
                            <div class="flex items-center justify-between gap-3 mb-2">
                                <div class="flex items-center gap-3">
                                    <span class="option-letter text-lg font-bold text-blue-600 min-w-[24px]">B.</span>
                                    <label class="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-300 cursor-pointer hover:bg-green-50 transition-colors">
                                        <input type="radio" name="correct-${currentQuestionIndex}" id="correct-${currentQuestionIndex}-1" value="1" class="w-4 h-4 text-green-600">
                                        <span class="text-sm text-gray-600">Correct Answer</span>
                                    </label>
                                </div>
                                <button type="button" onclick="removeOptionField(${currentQuestionIndex}, this)" class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition-colors" title="Remove option">
                                    🗑️
                                </button>
                            </div>
                            <div id="option-editor-${currentQuestionIndex}-1" class="bg-white border border-gray-300 rounded-lg" style="min-height: 50px;"></div>
                        </div>
                        <div class="option-editor-container p-3 bg-gray-50 rounded-lg" data-option-index="2">
                            <div class="flex items-center justify-between gap-3 mb-2">
                                <div class="flex items-center gap-3">
                                    <span class="option-letter text-lg font-bold text-blue-600 min-w-[24px]">C.</span>
                                    <label class="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-300 cursor-pointer hover:bg-green-50 transition-colors">
                                        <input type="radio" name="correct-${currentQuestionIndex}" id="correct-${currentQuestionIndex}-2" value="2" class="w-4 h-4 text-green-600">
                                        <span class="text-sm text-gray-600">Correct Answer</span>
                                    </label>
                                </div>
                                <button type="button" onclick="removeOptionField(${currentQuestionIndex}, this)" class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition-colors" title="Remove option">
                                    🗑️
                                </button>
                            </div>
                            <div id="option-editor-${currentQuestionIndex}-2" class="bg-white border border-gray-300 rounded-lg" style="min-height: 50px;"></div>
                        </div>
                        <div class="option-editor-container p-3 bg-gray-50 rounded-lg" data-option-index="3">
                            <div class="flex items-center justify-between gap-3 mb-2">
                                <div class="flex items-center gap-3">
                                    <span class="option-letter text-lg font-bold text-blue-600 min-w-[24px]">D.</span>
                                    <label class="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-300 cursor-pointer hover:bg-green-50 transition-colors">
                                        <input type="radio" name="correct-${currentQuestionIndex}" id="correct-${currentQuestionIndex}-3" value="3" class="w-4 h-4 text-green-600">
                                        <span class="text-sm text-gray-600">Correct Answer</span>
                                    </label>
                                </div>
                                <button type="button" onclick="removeOptionField(${currentQuestionIndex}, this)" class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition-colors" title="Remove option">
                                    🗑️
                                </button>
                            </div>
                            <div id="option-editor-${currentQuestionIndex}-3" class="bg-white border border-gray-300 rounded-lg" style="min-height: 50px;"></div>
                        </div>
                    </div>
                    <button type="button" onclick="addOptionField(${currentQuestionIndex})" class="mt-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600">
                        ➕ Add Option
                    </button>
                </div>
                
                <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-1">Explanation</label>
                    <div id="explanation-editor-${currentQuestionIndex}" class="bg-white border border-gray-300 rounded-lg" style="min-height: 80px;"></div>
                </div>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', blockHTML);

    // Initialize Quill editors and search functionality after DOM update
    requestAnimationFrame(() => {
        let attempts = 0;
        const maxAttempts = 15;

        function tryInit() {
            attempts++;

            const questionEditorEl = document.getElementById(`question-editor-${currentQuestionIndex}`);
            const explanationEditorEl = document.getElementById(`explanation-editor-${currentQuestionIndex}`);
            const subjectInput = document.getElementById(`subject-${currentQuestionIndex}`);
            const subjectSuggestions = document.getElementById(`subjectSuggestions-${currentQuestionIndex}`);
            const examTypeInput = document.getElementById(`examType-${currentQuestionIndex}`);
            const examTypeSuggestions = document.getElementById(`examTypeSuggestions-${currentQuestionIndex}`);
            const difficultyInput = document.getElementById(`difficulty-${currentQuestionIndex}`);
            const difficultySuggestions = document.getElementById(`difficultySuggestions-${currentQuestionIndex}`);

            if (questionEditorEl && explanationEditorEl && subjectInput && subjectSuggestions && examTypeInput && examTypeSuggestions && difficultyInput && difficultySuggestions) {
                // Initialize Quill editors for this question block
                initQuillEditorsForBlock(currentQuestionIndex);
                // Initialize search fields
                initIndividualQuestionSearchFields(currentQuestionIndex);
            } else if (attempts < maxAttempts) {
                setTimeout(tryInit, attempts * 150);
            }
        }

        tryInit();
    });

    questionCounter++;
}

// Initialize Quill editors for a question block
function initQuillEditorsForBlock(questionIndex) {
    // Initialize editors object for this question
    questionEditors[questionIndex] = {
        question: null,
        explanation: null,
        options: []
    };

    // Initialize Question Text Editor
    const questionEditorEl = document.getElementById(`question-editor-${questionIndex}`);
    if (questionEditorEl) {
        questionEditors[questionIndex].question = new Quill(`#question-editor-${questionIndex}`, {
            modules: {
                toolbar: fullToolbarOptions
            },
            theme: 'snow',
            placeholder: 'Enter your question text here...'
        });
    }

    // Initialize Option Editors (4 default options)
    for (let i = 0; i < 4; i++) {
        const optionEditorEl = document.getElementById(`option-editor-${questionIndex}-${i}`);
        if (optionEditorEl) {
            const optionEditor = new Quill(`#option-editor-${questionIndex}-${i}`, {
                modules: {
                    toolbar: minimalToolbarOptions
                },
                theme: 'snow',
                placeholder: `Enter option ${String.fromCharCode(65 + i)}...`
            });
            questionEditors[questionIndex].options.push(optionEditor);
        }
    }

    // Initialize Explanation Editor
    const explanationEditorEl = document.getElementById(`explanation-editor-${questionIndex}`);
    if (explanationEditorEl) {
        questionEditors[questionIndex].explanation = new Quill(`#explanation-editor-${questionIndex}`, {
            modules: {
                toolbar: fullToolbarOptions
            },
            theme: 'snow',
            placeholder: 'Provide explanation for the correct answer...'
        });
    }
}

// Note: getQuillHTML is loaded from shared/utils.js

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
    const optionCount = container.children.length;
    const newOptionIndex = optionCount;

    const optionHTML = `
        <div class="option-editor-container p-3 bg-gray-50 rounded-lg" data-option-index="${newOptionIndex}">
            <div class="flex items-center justify-between gap-3 mb-2">
                <div class="flex items-center gap-3">
                    <span class="option-letter text-lg font-bold text-blue-600 min-w-[24px]">${String.fromCharCode(65 + newOptionIndex)}.</span>
                    <label class="flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-300 cursor-pointer hover:bg-green-50 transition-colors">
                        <input type="radio" name="correct-${questionIndex}" id="correct-${questionIndex}-${newOptionIndex}" value="${newOptionIndex}" class="w-4 h-4 text-green-600">
                        <span class="text-sm text-gray-600">Correct Answer</span>
                    </label>
                </div>
                <button type="button" onclick="removeOptionField(${questionIndex}, this)" class="px-2 py-1 bg-red-100 text-red-600 text-xs rounded hover:bg-red-200 transition-colors" title="Remove option">
                    🗑️
                </button>
            </div>
            <div id="option-editor-${questionIndex}-${newOptionIndex}" class="bg-white border border-gray-300 rounded-lg" style="min-height: 50px;"></div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', optionHTML);

    // Initialize Quill editor for the new option after DOM update
    setTimeout(() => {
        const optionEditorEl = document.getElementById(`option-editor-${questionIndex}-${newOptionIndex}`);
        if (optionEditorEl) {
            const optionEditor = new Quill(`#option-editor-${questionIndex}-${newOptionIndex}`, {
                modules: {
                    toolbar: minimalToolbarOptions
                },
                theme: 'snow',
                placeholder: `Enter option ${String.fromCharCode(65 + newOptionIndex)}...`
            });
            if (questionEditors[questionIndex]) {
                questionEditors[questionIndex].options.push(optionEditor);
            }
        }
    }, 100);
}

// Remove option field from a specific question
function removeOptionField(questionIndex, buttonElement) {
    const container = document.getElementById(`options-${questionIndex}`);
    const optionContainers = container.querySelectorAll('.option-editor-container');
    
    // Ensure at least 2 options remain
    if (optionContainers.length <= 2) {
        showToast('A question must have at least 2 options.', 'warning');
        return;
    }
    
    // Find the option container to remove
    const optionContainer = buttonElement.closest('.option-editor-container');
    const optionIndex = parseInt(optionContainer.dataset.optionIndex);
    
    // Remove the option container from DOM
    optionContainer.remove();
    
    // Remove the corresponding Quill editor from the array
    if (questionEditors[questionIndex] && questionEditors[questionIndex].options[optionIndex]) {
        questionEditors[questionIndex].options.splice(optionIndex, 1);
    }
    
    // Re-index remaining options (update letters A, B, C, etc.)
    const remainingOptions = container.querySelectorAll('.option-editor-container');
    remainingOptions.forEach((opt, idx) => {
        // Update data-option-index
        opt.dataset.optionIndex = idx;
        
        // Update option letter
        const letterSpan = opt.querySelector('.option-letter');
        if (letterSpan) {
            letterSpan.textContent = String.fromCharCode(65 + idx) + '.';
        }
        
        // Update radio button value
        const radio = opt.querySelector('input[type="radio"]');
        if (radio) {
            radio.value = idx;
            radio.id = `correct-${questionIndex}-${idx}`;
        }
    });
    
    showToast('Option removed successfully.', 'info');
}

// Remove a question block
async function removeQuestionBlock(blockId, questionIndex) {
    const confirmed = await showConfirmDialog(
        'Are you sure you want to remove this question block?',
        'Remove Question',
        { confirmText: 'Remove', cancelText: 'Cancel', type: 'danger' }
    );
    
    if (confirmed) {
        const block = document.getElementById(blockId);
        if (block) {
            block.remove();
            // Clean up Quill editor references
            if (questionEditors[questionIndex]) {
                delete questionEditors[questionIndex];
            }
            autoSaveFormData();
        }
    }
}

// Clear all question blocks
async function clearAll() {
    const confirmed = await showConfirmDialog(
        'Are you sure you want to clear all question blocks? This cannot be undone.',
        'Clear All Questions',
        { confirmText: 'Clear All', cancelText: 'Cancel', type: 'danger' }
    );
    
    if (confirmed) {
        document.getElementById('questionsContainer').innerHTML = '';
        questionCounter = 0;
        // Clear all Quill editor references
        questionEditors = {};
        // Clear saved form data
        clearFormData(FORM_STORAGE_KEY);
        showToast('All questions cleared.', 'info');
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
        showLoading(true, `Saving ${questions.length} questions...`);

        const response = await fetch(API_URLS.CREATE_BULK_QUESTIONS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions: questions })
        });

        showLoading(false);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            showToast(`${result.count || questions.length} questions saved successfully!`, 'success');
            // Clear saved form data on successful save
            clearFormData(FORM_STORAGE_KEY);
        } else {
            showToast(result.message || 'Failed to save questions', 'error');
        }
    } catch (error) {
        showLoading(false);
        console.error('Error saving questions:', error);
        showToast('Error saving questions: ' + error.message, 'error');
    }
}

// Get question data from form - Updated to use Quill editors
function getQuestionData(index) {
    // Get question text from Quill editor
    let question = '';
    if (questionEditors[index] && questionEditors[index].question) {
        question = getQuillHTML(questionEditors[index].question);
    }

    if (!question) {
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

    // Get options from Quill editors
    const options = [];
    if (questionEditors[index] && questionEditors[index].options) {
        questionEditors[index].options.forEach(optionEditor => {
            const optionValue = getQuillHTML(optionEditor);
            if (optionValue) {
                options.push(optionValue);
            }
        });
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

    // Get explanation from Quill editor
    let explanation = '';
    if (questionEditors[index] && questionEditors[index].explanation) {
        explanation = getQuillHTML(questionEditors[index].explanation);
    }

    // Get other fields
    const topic = document.getElementById(`topic-${index}`).value;

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

// Note: showToast, logout, and animation styles are loaded from shared/utils.js

// ==================== FORM PERSISTENCE ====================

// Debounced auto-save function
const autoSaveFormData = debounce(function() {
    saveCurrentFormData();
}, 1000);

// Save current form data to localStorage
function saveCurrentFormData() {
    const formData = {
        defaults: {
            subject: document.getElementById('defaultSubject')?.value || '',
            year: document.getElementById('defaultYear')?.value || '',
            examType: document.getElementById('defaultExamType')?.value || '',
            difficulty: document.getElementById('defaultDifficulty')?.value || ''
        },
        questions: [],
        savedAt: new Date().toISOString()
    };

    // Get all question blocks
    const containers = document.querySelectorAll('[id^="question-block-"]');
    containers.forEach((container, idx) => {
        const questionData = {
            question: '',
            subject: document.getElementById(`subject-${idx}`)?.value || '',
            year: document.getElementById(`year-${idx}`)?.value || '',
            examType: document.getElementById(`examType-${idx}`)?.value || '',
            difficulty: document.getElementById(`difficulty-${idx}`)?.value || '',
            topic: document.getElementById(`topic-${idx}`)?.value || '',
            options: [],
            correctAnswer: 0,
            explanation: ''
        };

        // Get question text from Quill editor
        if (questionEditors[idx] && questionEditors[idx].question) {
            questionData.question = questionEditors[idx].question.root.innerHTML;
        }

        // Get options from Quill editors
        if (questionEditors[idx] && questionEditors[idx].options) {
            questionEditors[idx].options.forEach((optionEditor, optIdx) => {
                questionData.options.push(optionEditor.root.innerHTML);
                // Check if this is the correct answer
                const radio = document.getElementById(`correct-${idx}-${optIdx}`);
                if (radio && radio.checked) {
                    questionData.correctAnswer = optIdx;
                }
            });
        }

        // Get explanation from Quill editor
        if (questionEditors[idx] && questionEditors[idx].explanation) {
            questionData.explanation = questionEditors[idx].explanation.root.innerHTML;
        }

        formData.questions.push(questionData);
    });

    saveFormData(FORM_STORAGE_KEY, formData);
}

// Restore form data from localStorage
async function restoreFormData() {
    const formData = loadFormData(FORM_STORAGE_KEY);
    
    if (!formData || !formData.questions || formData.questions.length === 0) {
        return false;
    }

    // Check if data is not too old (24 hours)
    const savedTime = new Date(formData.savedAt);
    const now = new Date();
    const hoursDiff = (now - savedTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
        clearFormData(FORM_STORAGE_KEY);
        return false;
    }

    // Show confirmation to restore
    const confirmed = await showConfirmDialog(
        `Found ${formData.questions.length} unsaved question(s) from ${savedTime.toLocaleString()}. Would you like to restore them?`,
        'Restore Unsaved Work?',
        { confirmText: 'Restore', cancelText: 'Start Fresh', type: 'info' }
    );

    if (!confirmed) {
        clearFormData(FORM_STORAGE_KEY);
        return false;
    }

    // Restore defaults
    if (formData.defaults) {
        if (formData.defaults.subject) document.getElementById('defaultSubject').value = formData.defaults.subject;
        if (formData.defaults.year) document.getElementById('defaultYear').value = formData.defaults.year;
        if (formData.defaults.examType) document.getElementById('defaultExamType').value = formData.defaults.examType;
        if (formData.defaults.difficulty) document.getElementById('defaultDifficulty').value = formData.defaults.difficulty;
    }

    // Create question blocks and populate data
    for (let i = 0; i < formData.questions.length; i++) {
        if (i > 0) {
            addQuestionBlock();
        }
        
        // Wait for Quill editors to initialize
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const q = formData.questions[i];
        const idx = i;

        // Populate text fields
        if (q.subject) document.getElementById(`subject-${idx}`).value = q.subject;
        if (q.year) document.getElementById(`year-${idx}`).value = q.year;
        if (q.examType) document.getElementById(`examType-${idx}`).value = q.examType;
        if (q.difficulty) document.getElementById(`difficulty-${idx}`).value = q.difficulty;
        if (q.topic) document.getElementById(`topic-${idx}`).value = q.topic;

        // Populate Quill editors
        if (questionEditors[idx]) {
            if (questionEditors[idx].question && q.question) {
                questionEditors[idx].question.root.innerHTML = q.question;
            }
            
            if (questionEditors[idx].options && q.options) {
                q.options.forEach((optContent, optIdx) => {
                    if (questionEditors[idx].options[optIdx]) {
                        questionEditors[idx].options[optIdx].root.innerHTML = optContent;
                    }
                });
            }
            
            if (questionEditors[idx].explanation && q.explanation) {
                questionEditors[idx].explanation.root.innerHTML = q.explanation;
            }
        }

        // Set correct answer
        const radio = document.getElementById(`correct-${idx}-${q.correctAnswer}`);
        if (radio) radio.checked = true;
    }

    showToast(`Restored ${formData.questions.length} question(s) successfully!`, 'success');
    return true;
}

// Setup auto-save listeners for form fields
function setupAutoSave() {
    // Listen for input changes on text fields
    document.addEventListener('input', (e) => {
        if (e.target.closest('#questionsContainer') || 
            e.target.id.startsWith('default')) {
            autoSaveFormData();
        }
    });

    // Listen for radio button changes
    document.addEventListener('change', (e) => {
        if (e.target.type === 'radio' && e.target.name.startsWith('correct-')) {
            autoSaveFormData();
        }
    });

    // Save before page unload
    window.addEventListener('beforeunload', () => {
        saveCurrentFormData();
    });
}

// Refresh existing values from database
async function refreshExistingValues() {
    showToast('Refreshing database values...', 'info');

    await fetchExistingValues();

    // Re-initialize search fields for all existing question blocks
    const containers = document.querySelectorAll('[id^="question-block-"]');
    containers.forEach((container, index) => {
        initIndividualQuestionSearchFields(index);
    });

    showToast('Database values refreshed successfully!', 'success');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async function () {
    if (hasInitialized) {
        return;
    }

    hasInitialized = true;

    // Fetch existing values from the database
    await fetchExistingValues();

    // Initialize search fields
    initSearchFields();

    // Try to restore saved form data
    const restored = await restoreFormData();
    
    // If no data was restored, add one empty question block
    if (!restored) {
        addQuestionBlock();
    }

    // Setup auto-save for form persistence
    setupAutoSave();
});