// File: CodingTerminals-TestSeries/admin/question-upload.js

// Global Variables
let uploadedFiles = [];
let parsedQuestions = []; // Questions from file uploads (will be stored temporarily)
let databaseQuestions = []; // Questions from database
let currentQuestionSet = 'database'; // Track which set of questions is currently displayed ('database' or 'upload')
let currentEditingQuestion = null;
let subjectList = new Set(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Accountancy', 'Business Studies', 'Political Science', 'Psychology']);
let yearList = new Set();
let difficultyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
let confirmModalCallback = null;

// API Endpoints Configuration
const API_CONFIG = {
    BASE_URL: typeof appConfig !== 'undefined' && appConfig.API_BASE_URL ? appConfig.API_BASE_URL : 'http://localhost:3000/api',
    ENDPOINTS: {
        UPLOAD_QUESTION_PAPER: '/questions/upload',
        GET_ALL_QUESTIONS: '/questions',
        CREATE_QUESTION: '/questions',
        UPDATE_QUESTION: '/questions/',
        DELETE_QUESTION: '/questions/',
        IMPORT_CSV: '/questions/import/csv',
        IMPORT_EXCEL: '/questions/import/excel',
        IMPORT_TEXT: '/questions/import/text',
        SYNC_WITH_DB: '/questions/sync',
    }
};

// Construct full API URLs
const API_URLS = {
    UPLOAD_QUESTION_PAPER: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.UPLOAD_QUESTION_PAPER,
    GET_ALL_QUESTIONS: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.GET_ALL_QUESTIONS,
    CREATE_QUESTION: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.CREATE_QUESTION,
    UPDATE_QUESTION: (id) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.UPDATE_QUESTION + id,
    DELETE_QUESTION: (id) => API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.DELETE_QUESTION + id,
    IMPORT_CSV: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.IMPORT_CSV,
    IMPORT_EXCEL: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.IMPORT_EXCEL,
    IMPORT_TEXT: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.IMPORT_TEXT,
    SYNC_WITH_DB: API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SYNC_WITH_DB
};

// Initialize Dropzone
function initDropzone() {
    Dropzone.autoDiscover = false;

    const myDropzone = new Dropzone("#dropzone", {
        url: API_URLS.UPLOAD_QUESTION_PAPER,
        paramName: "file",
        maxFilesize: 100, // MB
        acceptedFiles: ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt",
        addRemoveLinks: true,
        dictDefaultMessage: "Drop files here or click to browse",
        init: function () {
            this.on("addedfile", function (file) {
                uploadedFiles.push(file);
                updateFilePreview();
            });

            this.on("removedfile", function (file) {
                uploadedFiles = uploadedFiles.filter(f => f.name !== file.name);
                updateFilePreview();
            });

            this.on("uploadprogress", function (file, progress, bytesSent) {
                updateProgress(progress, bytesSent);
            });

            this.on("success", function (file, response) {
                // Handle successful upload
                showToast('File uploaded successfully!', 'success');
                if (response && response.questions) {
                    // Add parsed questions if returned
                    parsedQuestions = [...parsedQuestions, ...response.questions];
                    updateQuestionsList();
                    updateSubjectFilters();
                    updateYearFilters();
                    updateDifficultyFilters();
                }
            });

            this.on("error", function (file, errorMessage) {
                showToast(`Upload failed: ${errorMessage}`, 'error');
            });

            this.on("complete", function (file) {
                hideProgress();
            });
        }
    });
}

// Update file preview
// Update file preview - Enhanced to handle multiple files
function updateFilePreview() {
    const filesList = document.getElementById('filesList');
    if (!filesList) {
        console.log('filesList element not found'); // Debug log
        return; // Safe check
    }

    console.log('Updating file preview, uploaded files count:', uploadedFiles.length); // Debug log

    if (uploadedFiles.length === 0) {
        filesList.innerHTML = '<p class="text-gray-500 text-sm">No files selected</p>';
        return;
    }

    filesList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-preview">
            <div class="flex justify-between items-center">
                <div>
                    <span class="font-medium">${file.name}</span>
                    <span class="text-xs text-gray-500 ml-2">${formatFileSize(file.size)}</span>
                </div>
                <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700 text-sm">
                    🗑️ Remove
                </button>
            </div>
        </div>
    `).join('');
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Remove file
function removeFile(index) {
    if (window.Dropzone) {
        const dz = Dropzone.forElement("#dropzone");
        dz.removeFile(uploadedFiles[index]);
    }
    uploadedFiles.splice(index, 1);
    updateFilePreview();
}

// Update progress bar
function updateProgress(progress, bytesSent) {
    const progressContainer = document.getElementById('progressContainer');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (progressContainer) {
        progressContainer.classList.remove('hidden');
        if (progressFill) progressFill.style.width = progress + '%';
        if (progressText) progressText.textContent = `Uploading... ${Math.round(progress)}% (${formatFileSize(bytesSent)})`;
    }
}

// Hide progress
function hideProgress() {
    const progressContainer = document.getElementById('progressContainer');
    if (progressContainer) {
        progressContainer.classList.add('hidden');
    }
}

// Process upload
async function processUpload() {
    if (uploadedFiles.length === 0) {
        showToast('Please select files to upload', 'warning');
        return;
    }

    const subject = document.getElementById('subjectSelect').value;
    const academicYear = document.getElementById('academicYear').value;
    const examType = document.getElementById('examType').value;
    const difficulty = document.getElementById('difficultyLevel').value;
    const autoParse = document.getElementById('autoParse').checked;

    if (!subject) {
        showToast('Please select a subject', 'error');
        return;
    }

    if (!academicYear) {
        showToast('Please enter academic year', 'error');
        return;
    }

    try {
        // Prepare form data for API request
        const formData = new FormData();

        // Add files
        uploadedFiles.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });

        // Add metadata
        formData.append('subject', subject);
        formData.append('academicYear', academicYear);
        formData.append('examType', examType);
        formData.append('difficulty', difficulty);
        formData.append('autoParse', autoParse);

        // Show processing message
        showToast('Processing files...', 'info');

        // Make API call
        const response = await fetch(API_URLS.UPLOAD_QUESTION_PAPER, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            if (result.questions && result.questions.length > 0) {
                parsedQuestions = [...parsedQuestions, ...result.questions];
                updateQuestionsList();
                updateSubjectFilters();
                updateYearFilters();
                updateDifficultyFilters();
                showToast(`${result.questions.length} questions processed and added!`, 'success');
            } else {
                showToast('Files uploaded successfully!', 'success');
            }
        } else {
            showToast(result.message || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed: ' + error.message, 'error');
    }
}

// Load questions from API
// Load questions from API
async function loadQuestionsFromAPI() {
    try {
        const response = await fetch(API_URLS.GET_ALL_QUESTIONS);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            databaseQuestions = result.data || [];
            // Update the current view based on which tab is active
            updateQuestionsList();
            updateSubjectFilters();
            updateYearFilters();
            updateDifficultyFilters();
        } else {
            showToast(result.message || 'Failed to load questions', 'error');
        }
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('Error loading questions: ' + error.message, 'error');
    }
}

// Handle file import - Fixed with DOM readiness check
async function handleFileImport(event, importType = 'auto') {
    const file = event.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const fileExtension = fileName.split('.').pop().toLowerCase();

    // Determine import type based on file extension if not specified
    if (importType === 'auto') {
        if (['csv'].includes(fileExtension)) {
            importType = 'csv';
        } else if (['xlsx', 'xls'].includes(fileExtension)) {
            importType = 'excel';
        } else {
            importType = 'text';
        }
    }

    try {
        showToast(`Parsing ${fileName}...`, 'info');

        // Read file content
        const fileContent = await readFileContent(file);

        // Parse file based on type
        let parsedQuestionsFromFile = [];

        switch (importType) {
            case 'csv':
                parsedQuestionsFromFile = parseCSVFile(fileContent);
                break;
            case 'excel':
                parsedQuestionsFromFile = parseExcelFile(fileContent);
                break;
            case 'text':
                parsedQuestionsFromFile = parseTextFile(fileContent);
                break;
        }

        console.log('Parsed questions from file:', parsedQuestionsFromFile); // Debug log
        console.log('Current parsedQuestions before merge:', parsedQuestions); // Debug log

        if (parsedQuestionsFromFile.length > 0) {
            // Add parsed questions to the uploaded questions array (don't replace database questions)
            parsedQuestions = [...parsedQuestions, ...parsedQuestionsFromFile];

            console.log('Updated parsedQuestions after merge:', parsedQuestions); // Debug log
            console.log('Total uploaded questions in array:', parsedQuestions.length); // Debug log

            // Switch to the upload tab to show the uploaded questions
            switchToTab('upload');

            // Update UI to show uploaded questions
            setTimeout(() => {
                updateQuestionsList();
                updateSubjectFilters();
                updateYearFilters();
                updateDifficultyFilters();

                // Also update the question count display
                const questionCount = document.getElementById('questionCount');
                if (questionCount) {
                    questionCount.textContent = parsedQuestions.length;
                    console.log('Updated question count display:', parsedQuestions.length); // Debug log
                }
            }, 100); // Small delay to ensure DOM is ready

            showToast(`${parsedQuestionsFromFile.length} questions loaded from ${fileName}! Review and click 'Process Upload' to save.`, 'success');
        } else {
            showToast('No valid questions found in the file', 'warning');
        }
    } catch (error) {
        console.error('Error parsing file:', error);
        showToast('Error parsing file: ' + error.message, 'error');
    }
}

// Switch between database and uploaded questions tabs
function switchToTab(tabName) {
    // Update the current question set
    currentQuestionSet = tabName;

    // Update tab UI
    const dbTab = document.getElementById('dbTab');
    const uploadTab = document.getElementById('uploadTab');

    if (dbTab && uploadTab) {
        if (tabName === 'database') {
            dbTab.classList.add('active', 'text-blue-600', 'border-blue-600');
            dbTab.classList.remove('text-gray-500', 'border-transparent');
            uploadTab.classList.remove('active', 'text-blue-600', 'border-blue-600');
            uploadTab.classList.add('text-gray-500', 'border-transparent');
        } else {
            uploadTab.classList.add('active', 'text-blue-600', 'border-blue-600');
            uploadTab.classList.remove('text-gray-500', 'border-transparent');
            dbTab.classList.remove('active', 'text-blue-600', 'border-blue-600');
            dbTab.classList.add('text-gray-500', 'border-transparent');
        }
    }

    // Update the questions list to show the selected set
    updateQuestionsList();
}

// Initialize tab functionality
function initializeTabs() {
    const dbTab = document.getElementById('dbTab');
    const uploadTab = document.getElementById('uploadTab');

    if (dbTab) {
        dbTab.addEventListener('click', () => switchToTab('database'));
    }

    if (uploadTab) {
        uploadTab.addEventListener('click', () => switchToTab('upload'));
    }
}


// Update questions list display - Fixed with proper checks and tab support
function updateQuestionsList() {
    // Wait for DOM to be fully loaded if needed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateQuestionsList);
        return;
    }

    // Find the main container element
    const container = document.getElementById('questionsContainer');
    const questionCount = document.getElementById('questionCount');

    // Log what we found to help debug
    console.log('Looking for elements: questionsContainer:', !!container, 'questionCount:', !!questionCount);

    // Check if main elements exist
    if (!container || !questionCount) {
        console.log('Main UI elements not found.');
        return; // Exit if critical elements are missing
    }

    // Determine which question set to display based on current tab
    let questionsToDisplay;
    if (currentQuestionSet === 'database') {
        questionsToDisplay = databaseQuestions;
    } else {
        questionsToDisplay = parsedQuestions;
    }

    console.log('Updating questions list, total questions:', questionsToDisplay.length); // Debug log

    // Update the question count display based on current tab
    questionCount.textContent = questionsToDisplay.length;

    if (questionsToDisplay.length === 0) {
        // If there are no questions, we need to restore the empty state
        container.innerHTML = `
            <div class="text-center py-8 text-gray-400" id="emptyState">
                <div class="text-4xl mb-4">📚</div>
                <h3 class="text-lg font-semibold">No questions ${currentQuestionSet === 'database' ? 'in database' : 'uploaded'} yet</h3>
                <p class="text-sm">${currentQuestionSet === 'database' ? 'Load questions from database' : 'Upload question papers or import questions to get started'}</p>
            </div>
        `;
        return;
    }

    // If there are questions, clear the container and add the questions
    // We don't need the empty state anymore since we have questions
    container.innerHTML = '';

    // Apply filters based on current question set
    const filteredQuestions = applyFilters(questionsToDisplay);
    console.log('Filtered questions count:', filteredQuestions.length); // Debug log

    // Generate HTML for questions
    let questionsHTML = '';
    if (filteredQuestions.length === 0) {
        questionsHTML = '<div class="text-center py-8 text-gray-500">No questions match the current filters</div>';
    } else {
        questionsHTML = filteredQuestions.map((question, index) => `
            <div class="question-preview">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 mb-2">${question.question || 'No question text'}</h4>
                        <div class="flex flex-wrap gap-2 mb-2">
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${question.subject || 'No subject'}</span>
                            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${question.academicYear || 'No year'}</span>
                            <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">${question.examType || 'No exam type'}</span>
                            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">${question.difficulty || 'No difficulty'}</span>
                            <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">${question.topic || 'No topic'}</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editQuestion(${index})" class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                            ✏️ Edit
                        </button>
                        <button onclick="deleteQuestion(${index})" class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 mb-3">
                    ${(question.options || []).map((option, optIndex) => `
                        <div class="question-option ${optIndex === question.correctAnswer ? 'correct-answer' : ''}">
                            <label class="flex items-center">
                                <input type="radio" disabled ${optIndex === question.correctAnswer ? 'checked' : ''}>
                                <span class="ml-2">${String.fromCharCode(65 + optIndex)}. ${option || 'No option text'}</span>
                                ${optIndex === question.correctAnswer ? '<span class="ml-2 text-green-600 text-xs">✓ Correct</span>' : ''}
                            </label>
                        </div>
                    `).join('')}
                </div>
                
                ${question.explanation ? `
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div class="font-semibold text-blue-800 text-sm mb-1">Explanation:</div>
                        <div class="text-sm text-blue-700">${question.explanation}</div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Update the container with new HTML
    container.innerHTML = questionsHTML;
    console.log('Questions list updated in UI'); // Debug log
}

// Helper function to actually update the display
function updateQuestionsDisplay(targetContainer, targetEmptyState, targetQuestionCount) {
    console.log('Updating questions list, total questions:', parsedQuestions.length); // Debug log

    if (parsedQuestions.length === 0) {
        targetEmptyState.style.display = 'block';
        targetContainer.innerHTML = '';
        if (targetQuestionCount) targetQuestionCount.textContent = '0';
        console.log('No questions, showing empty state'); // Debug log
        return;
    }

    targetEmptyState.style.display = 'none';
    if (targetQuestionCount) targetQuestionCount.textContent = parsedQuestions.length;

    // Apply filters
    const filteredQuestions = applyFilters();
    console.log('Filtered questions count:', filteredQuestions.length); // Debug log

    // Generate HTML for questions
    let questionsHTML = '';
    if (filteredQuestions.length === 0) {
        questionsHTML = '<div class="text-center py-8 text-gray-500">No questions match the current filters</div>';
    } else {
        questionsHTML = filteredQuestions.map((question, index) => `
            <div class="question-preview">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h4 class="font-semibold text-gray-800 mb-2">${question.question || 'No question text'}</h4>
                        <div class="flex flex-wrap gap-2 mb-2">
                            <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${question.subject || 'No subject'}</span>
                            <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${question.academicYear || 'No year'}</span>
                            <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">${question.examType || 'No exam type'}</span>
                            <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">${question.difficulty || 'No difficulty'}</span>
                            <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">${question.topic || 'No topic'}</span>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="editQuestion(${index})" class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600">
                            ✏️ Edit
                        </button>
                        <button onclick="deleteQuestion(${index})" class="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
                
                <div class="space-y-2 mb-3">
                    ${(question.options || []).map((option, optIndex) => `
                        <div class="question-option ${optIndex === question.correctAnswer ? 'correct-answer' : ''}">
                            <label class="flex items-center">
                                <input type="radio" disabled ${optIndex === question.correctAnswer ? 'checked' : ''}>
                                <span class="ml-2">${String.fromCharCode(65 + optIndex)}. ${option || 'No option text'}</span>
                                ${optIndex === question.correctAnswer ? '<span class="ml-2 text-green-600 text-xs">✓ Correct</span>' : ''}
                            </label>
                        </div>
                    `).join('')}
                </div>
                
                ${question.explanation ? `
                    <div class="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div class="font-semibold text-blue-800 text-sm mb-1">Explanation:</div>
                        <div class="text-sm text-blue-700">${question.explanation}</div>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    // Update the container with new HTML
    targetContainer.innerHTML = questionsHTML;
    console.log('Questions list updated in UI'); // Debug log
}


// Apply filters to questions - Updated to accept a question set as parameter
function applyFilters(questionsToFilter = null) {
    // Use the current question set if none is provided
    if (!questionsToFilter) {
        if (currentQuestionSet === 'database') {
            questionsToFilter = databaseQuestions;
        } else {
            questionsToFilter = parsedQuestions;
        }
    }

    const subjectFilter = document.getElementById('filterSubject');
    const yearFilter = document.getElementById('filterYear');
    const difficultyFilter = document.getElementById('filterDifficulty');
    const searchQuery = document.getElementById('searchQuestions');

    if (!subjectFilter || !yearFilter || !difficultyFilter || !searchQuery) return questionsToFilter;

    const subjectValue = subjectFilter.value;
    const yearValue = yearFilter.value;
    const difficultyValue = difficultyFilter.value;
    const searchValue = searchQuery.value.toLowerCase();

    return questionsToFilter.filter(question => {
        const matchesSubject = subjectValue === 'all' || question.subject === subjectValue;
        const matchesYear = yearValue === 'all' || question.academicYear === yearValue;
        const matchesDifficulty = difficultyValue === 'all' || question.difficulty === difficultyValue;
        const matchesSearch = !searchValue ||
            question.question.toLowerCase().includes(searchValue) ||
            question.explanation.toLowerCase().includes(searchValue) ||
            question.topic.toLowerCase().includes(searchValue);

        return matchesSubject && matchesYear && matchesDifficulty && matchesSearch;
    });
}

// Update subject filters dropdown
function updateSubjectFilters() {
    const filterSelect = document.getElementById('filterSubject');
    if (!filterSelect) return;

    const uniqueSubjects = new Set(parsedQuestions.map(q => q.subject));

    // Clear existing options except "All Subjects"
    filterSelect.innerHTML = '<option value="all">All Subjects</option>';

    // Add unique subjects
    uniqueSubjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        filterSelect.appendChild(option);
    });
}

// Update year filters dropdown
function updateYearFilters() {
    const filterSelect = document.getElementById('filterYear');
    if (!filterSelect) return;

    const uniqueYears = new Set(parsedQuestions.map(q => q.academicYear));

    // Clear existing options except "All Years"
    filterSelect.innerHTML = '<option value="all">All Years</option>';

    // Add unique years
    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterSelect.appendChild(option);
    });
}

// Update difficulty filters dropdown
function updateDifficultyFilters() {
    const filterSelect = document.getElementById('filterDifficulty');
    if (!filterSelect) return;

    // Clear existing options except "All Levels"
    filterSelect.innerHTML = '<option value="all">All Levels</option>';

    // Add difficulty levels
    difficultyLevels.forEach(level => {
        const option = document.createElement('option');
        option.value = level;
        option.textContent = level;
        filterSelect.appendChild(option);
    });
}

// Edit question - Fixed to handle both database and uploaded questions
function editQuestion(index) {
    // Determine which question set we're working with based on the current tab
    let questionsArray;
    if (currentQuestionSet === 'database') {
        questionsArray = databaseQuestions;
    } else {
        questionsArray = parsedQuestions;
    }

    // Check if the index is valid
    if (index < 0 || index >= questionsArray.length) {
        showToast('Invalid question index', 'error');
        return;
    }

    const question = questionsArray[index];

    // Check if question exists
    if (!question) {
        showToast('Question not found', 'error');
        return;
    }

    currentEditingQuestion = index;

    // Store which question set we're editing for save operation
    currentEditingQuestionSet = currentQuestionSet;

    // Create edit modal or use inline editing
    showEditModal(question, index);
}

// Show edit modal - Fixed to handle undefined question parameter
function showEditModal(question, index) {
    // Check if question exists
    if (!question) {
        showToast('Question not found', 'error');
        return;
    }

    const modalHTML = `
        <div id="editModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <div class="flex justify-between items-start mb-4">
                    <h3 class="text-xl font-bold text-gray-800">Edit Question</h3>
                    <button onclick="closeEditModal()" class="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">
                        ×
                    </button>
                </div>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Question Text</label>
                        <textarea id="editQuestionText" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3">${question.question || ''}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                            <select id="editSubject" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                ${Array.from(subjectList).map(subj => `<option value="${subj}" ${subj === (question.subject || '') ? 'selected' : ''}>${subj}</option>`).join('')}
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
                                ${difficultyLevels.map(level => `<option value="${level}" ${level === (question.difficulty || '') ? 'selected' : ''}>${level}</option>`).join('')}
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
                            ${(question.options || []).map((option, optIndex) => `
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-sm font-medium">${String.fromCharCode(65 + optIndex)}.</span>
                                    <input type="text" 
                                           value="${option || ''}" 
                                           id="editOption${optIndex}" 
                                           class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                    <label class="flex items-center gap-1">
                                        <input type="radio" name="correctAnswer" value="${optIndex}" ${optIndex === (question.correctAnswer || 0) ? 'checked' : ''}>
                                        <span class="text-sm">Correct</span>
                                    </label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Explanation</label>
                        <textarea id="editExplanation" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3">${question.explanation || ''}</textarea>
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-4">
                        <button onclick="closeEditModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all">
                            Cancel
                        </button>
                        <button onclick="saveEditedQuestion(${index})" class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}


// Add a variable to store which question set we're editing
let currentEditingQuestionSet = 'database';



// Download sample CSV file - Pure CSV format
function downloadSampleCSV() {
    const csvContent = `"question","options_a","options_b","options_c","options_d","correctAnswer","explanation","subject","academicYear","examType","difficulty","topic","marks","group","duplicateOf","isActive","metadata_validationStatus"
"What is your name?","ALL","ALL 2","ALL 4","ALL 7",0,"","Physics","2024-2026","Competitive Exam","Advanced","","1","","null",true,"pending"
"What is the capital of France?","London","Berlin","Paris","Madrid",2,"Paris is the capital and largest city of France.","Geography","2024-2025","Board Exam","Beginner","World Geography",1,"","null",true,"pending"`;

    // Create a Blob with pure CSV content - standard CSV MIME type
    const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;'
    });

    // Create a temporary link element
    const link = document.createElement('a');

    // Create an object URL for the blob
    const url = URL.createObjectURL(blob);

    // Generate unique filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `sample_questions_csv_${timestamp}.csv`;

    // Set the download attributes
    link.href = url;
    link.download = filename;
    link.style.display = 'none'; // Hide the link

    // Add to document, click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    URL.revokeObjectURL(url);

    // Show confirmation
    showToast(`Downloading ${filename}`, 'success');
}

// Download sample Excel-compatible file - Different format for Excel
function downloadSampleExcel() {
    const excelContent = `question	options_a	options_b	options_c	options_d	correctAnswer	explanation	subject	academicYear	examType	difficulty	topic	marks	group	duplicateOf	isActive	metadata_validationStatus
What is your name?	ALL	ALL 2	ALL 4	ALL 7	0		Physics	2024-2026	Competitive Exam	Advanced		1			true	pending
What is the capital of France?	London	Berlin	Paris	Madrid	2	Paris is the capital and largest city of France.	Geography	2024-2025	Board Exam	Beginner	World Geography	1	    	true	pending`;

    // Create a Blob with tab-separated content - Excel-friendly format
    const blob = new Blob([excelContent], {
        type: 'application/vnd.ms-excel;charset=utf-8;'
    });

    // Create a temporary link element
    const link = document.createElement('a');

    // Create an object URL for the blob
    const url = URL.createObjectURL(blob);

    // Generate unique filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `sample_questions_excel_${timestamp}.xls`;

    // Set the download attributes
    link.href = url;
    link.download = filename;
    link.style.display = 'none'; // Hide the link

    // Add to document, click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    URL.revokeObjectURL(url);

    // Show confirmation
    showToast(`Downloading ${filename}`, 'success');
}

// ... rest of existing code ...

// Download sample TXT file with unique timestamp
function downloadSampleTXT() {
    const txtContent = `---
question: What is your name?
options:
  - ALL
  - ALL 2
  - ALL 4
  - ALL 7
correctAnswer: 0
explanation: ""
subject: Physics
academicYear: "2024-2026"
examType: "Competitive Exam"
difficulty: "Advanced"
topic: ""
marks: 1
group: ""
duplicateOf: null
isActive: true
metadata:
  validationStatus: "pending"
---
---
question: What is the capital of France?
options:
  - London
  - Berlin
  - Paris
  - Madrid
correctAnswer: 2
explanation: "Paris is the capital and largest city of France."
subject: Geography
academicYear: "2024-2025"
examType: "Board Exam"
difficulty: "Beginner"
topic: "World Geography"
marks: 1
group: ""
duplicateOf: null
isActive: true
metadata:
  validationStatus: "pending"
---`;
    // Create a Blob with the TXT content
    const blob = new Blob([txtContent], {
        type: 'text/plain;charset=utf-8;'
    });

    // Create a temporary link element
    const link = document.createElement('a');

    // Create an object URL for the blob
    const url = URL.createObjectURL(blob);

    // Generate unique filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `sample_questions_${timestamp}.txt`;

    // Set the download attributes
    link.href = url;
    link.download = filename;
    link.style.display = 'none'; // Hide the link

    // Add to document, click, then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the object URL
    URL.revokeObjectURL(url);

    // Show confirmation
    showToast(`Downloading ${filename}`, 'success');
}


// ... rest of existing code ...

// Add new question manually
function addNewQuestionManually() {
    // Create a temporary question object
    const newQuestion = {
        id: 'temp_' + Date.now(),
        question: 'New question text...',
        subject: document.getElementById('subjectSelect').value || '',
        academicYear: document.getElementById('academicYear').value || new Date().getFullYear().toString(),
        examType: document.getElementById('examType').value || 'Practice Paper',
        difficulty: document.getElementById('difficultyLevel').value || 'Beginner',
        topic: '',
        explanation: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    };

    // Add to local array
    parsedQuestions.unshift(newQuestion);
    updateQuestionsList();
    updateSubjectFilters();
    updateYearFilters();
    updateDifficultyFilters();

    // Immediately edit the new question
    editQuestion(0);
}

// Save edited question - Updated to handle both database and uploaded questions
async function saveEditedQuestion(index) {
    // Determine which question set we're working with based on which set was being edited
    let questionsArray;
    if (currentEditingQuestionSet === 'database') {
        questionsArray = databaseQuestions;
    } else {
        questionsArray = parsedQuestions;
    }

    // Check if the index is valid
    if (index < 0 || index >= questionsArray.length) {
        showToast('Invalid question index', 'error');
        closeEditModal();
        return;
    }

    const question = questionsArray[index];

    // Check if question exists
    if (!question) {
        showToast('Question not found', 'error');
        closeEditModal();
        return;
    }

    // Get updated values
    const updatedQuestion = {
        id: question.id,
        _id: question._id,  // Include _id as well to handle both properties
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

    // Update options
    const optionElements = document.querySelectorAll('[id^="editOption"]');
    updatedQuestion.options = Array.from(optionElements).map(el => el.value).filter(val => val && val.trim() !== '');

    // Update correct answer
    const correctAnswerRadio = document.querySelector('input[name="correctAnswer"]:checked');
    if (correctAnswerRadio) {
        updatedQuestion.correctAnswer = parseInt(correctAnswerRadio.value);
    }

    try {
        if (currentEditingQuestionSet === 'database') {
            // Use either _id or id for the API call, prioritizing _id if it exists
            const questionId = question._id || question.id;
            if (!questionId) {
                showToast('Question ID not found', 'error');
                closeEditModal();
                return;
            }

            // Make API call to update question
            const response = await fetch(API_URLS.UPDATE_QUESTION(questionId), {
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
                // Update local question data
                Object.assign(question, updatedQuestion);

                // Update subject list if new subject was added
                subjectList.add(question.subject);

                // Close modal and refresh display
                closeEditModal();
                showToast('Question updated successfully!', 'success');
                // Reload questions to ensure consistency
                loadQuestionsFromAPI();
            } else {
                showToast(result.message || 'Failed to update question', 'error');
            }
        } else {
            // This is an uploaded question, just update the local array
            Object.assign(question, updatedQuestion);

            // Close modal and refresh display
            closeEditModal();
            updateQuestionsList();
            showToast('Question updated in upload list!', 'success');
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
        modal.remove();
    }
}


// Delete question - Fixed to properly handle both database and uploaded questions
async function deleteQuestion(index) {
    // Determine which question set we're working with based on the current tab
    let questionsArray;
    if (currentQuestionSet === 'database') {
        questionsArray = databaseQuestions;
    } else {
        questionsArray = parsedQuestions;
    }

    // Check if the index is valid
    if (index < 0 || index >= questionsArray.length) {
        showToast('Invalid question index', 'error');
        return;
    }

    const question = questionsArray[index];

    // Check if question exists
    if (!question) {
        showToast('Question not found', 'error');
        return;
    }

    showConfirmModal('Delete Question', 'Are you sure you want to delete this question? This action cannot be undone.', async () => {
        try {
            // Check if this is a database question (has _id) or uploaded question
            if (currentQuestionSet === 'database') {
                // This is a database question, make API call to delete
                const questionId = question._id || question.id;
                if (!questionId) {
                    showToast('Question ID not found', 'error');
                    return;
                }

                const response = await fetch(API_URLS.DELETE_QUESTION(questionId), {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                if (result.success) {
                    // Remove from local array
                    databaseQuestions.splice(index, 1);
                    updateQuestionsList();
                    showToast('Question deleted successfully!', 'success');
                    // Refresh data from database to show updated count
                    loadQuestionsFromAPI();
                } else {
                    showToast(result.message || 'Failed to delete question', 'error');
                }
            } else {
                // This is an uploaded question, just remove from local array
                parsedQuestions.splice(index, 1);
                updateQuestionsList();
                showToast('Question removed from upload list!', 'success');

                // Update the question count display
                const questionCount = document.getElementById('questionCount');
                if (questionCount) {
                    questionCount.textContent = parsedQuestions.length;
                }
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            showToast('Error deleting question: ' + error.message, 'error');
        }
    });
}

// Import from CSV
async function importFromCSV() {
    document.getElementById('importFileInput').accept = '.csv';
    document.getElementById('importFileInput').onchange = async function (e) {
        await handleFileImport(e, 'csv');
    };
    document.getElementById('importFileInput').click();
}

// Import from Excel
async function importFromExcel() {
    document.getElementById('importFileInput').accept = '.xlsx,.xls';
    document.getElementById('importFileInput').onchange = async function (e) {
        await handleFileImport(e, 'excel');
    };
    document.getElementById('importFileInput').click();
}

// Import from Text
async function importFromText() {
    document.getElementById('importFileInput').accept = '.txt,.pdf,.doc,.docx';
    document.getElementById('importFileInput').onchange = async function (e) {
        await handleFileImport(e, 'text');
    };
    document.getElementById('importFileInput').click();
}

// Handle file import - Fixed to ensure UI updates


// Helper function to read file content
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

// Parse CSV file content
function parseCSVFile(content) {
    const lines = content.trim().split(/\r?\n/); // Handle both \n and \r\n line endings
    if (lines.length < 2) return [];

    // Parse headers - handle quoted fields
    const headers = parseCSVLine(lines[0]);

    const questions = [];

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue; // Skip empty lines

        const values = parseCSVLine(lines[i]);
        if (values.length < headers.length) continue; // Skip incomplete rows

        const questionObj = {
            options: [],
            correctAnswer: 0,
            subject: 'General',
            academicYear: new Date().getFullYear().toString(),
            examType: 'Practice Paper',
            difficulty: 'Beginner',
            topic: '',
            explanation: '',
            marks: 1,
            group: '',
            duplicateOf: null,
            isActive: true
        };

        // Map CSV columns to question object properties
        headers.forEach((header, index) => {
            const value = index < values.length ? values[index] : '';
            const cleanHeader = header.toLowerCase().replace(/[^a-z]/g, ''); // Remove spaces and make lowercase

            switch (cleanHeader) {
                case 'question':
                    questionObj.question = value;
                    break;
                case 'optionsa':
                case 'options_a':
                    questionObj.options[0] = value;
                    break;
                case 'optionsb':
                case 'options_b':
                    questionObj.options[1] = value;
                    break;
                case 'optionsc':
                case 'options_c':
                    questionObj.options[2] = value;
                    break;
                case 'optionsd':
                case 'options_d':
                    questionObj.options[3] = value;
                    break;
                case 'correctanswer':
                    // Handle only numeric correct answers (0,1,2,3)
                    questionObj.correctAnswer = parseInt(value) || 0;
                    break;
                case 'subject':
                    questionObj.subject = value || 'General';
                    break;
                case 'academicyear':
                case 'academicyear':
                    questionObj.academicYear = value || new Date().getFullYear().toString();
                    break;
                case 'examtype':
                case 'examtype':
                    questionObj.examType = value || 'Practice Paper';
                    break;
                case 'difficulty':
                    questionObj.difficulty = value || 'Beginner';
                    break;
                case 'topic':
                    questionObj.topic = value || '';
                    break;
                case 'explanation':
                    questionObj.explanation = value || '';
                    break;
                case 'marks':
                    questionObj.marks = parseInt(value) || 1;
                    break;
            }
        });

        // Validate required fields
        if (questionObj.question && questionObj.options.filter(opt => opt !== undefined && opt !== '').length >= 2) {
            questions.push(questionObj);
        }
    }

    return questions;
}

// Helper function to properly parse CSV lines that may contain quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = i < line.length - 1 ? line[i + 1] : '';

        if (char === '"' && !inQuotes) {
            inQuotes = true;
        } else if (char === '"' && nextChar === '"') {
            // Handle escaped quotes
            current += '"';
            i++; // Skip next quote
        } else if (char === '"' && inQuotes && nextChar !== '"') {
            inQuotes = false;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current.trim());
    return result;
}

// Parse Excel file content (simplified - would need actual Excel parsing library)
function parseExcelFile(content) {
    // This is a simplified parser for tab-separated Excel exports
    // In a real implementation, you'd use a library like xlsx.js
    return parseCSVFile(content.replace(/\t/g, ','));
}

// Parse text file content (YAML-like format)
function parseTextFile(content) {
    const sections = content.split('---').filter(section => section.trim());
    const questions = [];

    sections.forEach(section => {
        const lines = section.trim().split('\n');
        const questionObj = {
            options: []
        };

        let currentKey = '';
        let currentValue = '';
        let inOptions = false;

        lines.forEach(line => {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith('- ')) {
                // Option line
                if (inOptions) {
                    questionObj.options.push(trimmedLine.substring(2));
                }
            } else if (trimmedLine.includes(':')) {
                // Key-value line
                const colonIndex = trimmedLine.indexOf(':');
                const key = trimmedLine.substring(0, colonIndex).trim();
                const value = trimmedLine.substring(colonIndex + 1).trim().replace(/^"|"$/g, '');

                switch (key.toLowerCase()) {
                    case 'question':
                        questionObj.question = value;
                        break;
                    case 'options':
                        inOptions = true;
                        break;
                    case 'correctanswer':
                        questionObj.correctAnswer = parseInt(value) || 0;
                        break;
                    case 'subject':
                        questionObj.subject = value || 'General';
                        break;
                    case 'academicyear':
                        questionObj.academicYear = value || new Date().getFullYear().toString();
                        break;
                    case 'examtype':
                        questionObj.examType = value || 'Practice Paper';
                        break;
                    case 'difficulty':
                        questionObj.difficulty = value || 'Beginner';
                        break;
                    case 'topic':
                        questionObj.topic = value || '';
                        break;
                    case 'explanation':
                        questionObj.explanation = value || '';
                        break;
                    case 'marks':
                        questionObj.marks = parseInt(value) || 1;
                        break;
                    case 'group':
                        questionObj.group = value || '';
                        break;
                    case 'duplicateof':
                        questionObj.duplicateOf = value === 'null' ? null : value;
                        break;
                    case 'isactive':
                        questionObj.isActive = value.toLowerCase() === 'true';
                        break;
                }
            }
        });

        // Validate and add question
        if (questionObj.question && questionObj.options.length >= 2) {
            questions.push(questionObj);
        }
    });

    return questions;
}

// Save all questions to backend - Updated to save only uploaded questions
async function saveAllQuestions() {
    if (parsedQuestions.length === 0) {
        showToast('No uploaded questions to save', 'warning');
        return;
    }

    try {
        showToast('Saving all uploaded questions...', 'info');

        // Make API call to save all uploaded questions
        const response = await fetch(API_URLS.CREATE_QUESTION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions: parsedQuestions })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // After successful save, move questions to databaseQuestions and clear uploaded questions
            databaseQuestions = [...databaseQuestions, ...parsedQuestions];
            parsedQuestions = []; // Clear uploaded questions

            // Switch back to database tab to show all questions
            switchToTab('database');

            // Update the question count display
            const questionCount = document.getElementById('questionCount');
            if (questionCount) {
                questionCount.textContent = databaseQuestions.length;
            }

            // Show success message with actual number of questions saved
            const savedCount = result.count || result.saved || parsedQuestions.length || databaseQuestions.length;
            showToast(`${savedCount} questions saved successfully!`, 'success');

            // Update filters after saving
            updateSubjectFilters();
            updateYearFilters();
            updateDifficultyFilters();
        } else {
            showToast(result.message || 'Failed to save questions', 'error');
        }
    } catch (error) {
        console.error('Error saving questions:', error);
        showToast('Error saving questions: ' + error.message, 'error');
    }
}

// Sync with MongoDB - Updated to sync only uploaded questions
async function syncWithMongoDB() {
    if (parsedQuestions.length === 0) {
        showToast('No uploaded questions to sync', 'warning');
        return;
    }

    try {
        showToast('Syncing uploaded questions with database...', 'info');

        // Make API call to sync uploaded questions with database
        const response = await fetch(API_URLS.SYNC_WITH_DB, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions: parsedQuestions })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            // After successful sync, move questions to databaseQuestions and clear uploaded questions
            databaseQuestions = [...databaseQuestions, ...parsedQuestions];
            parsedQuestions = []; // Clear uploaded questions

            // Switch back to database tab to show all questions
            switchToTab('database');

            // Update the question count display
            const questionCount = document.getElementById('questionCount');
            if (questionCount) {
                questionCount.textContent = databaseQuestions.length;
            }

            // Show success message with actual number of questions synced
            const syncedCount = result.synced || result.count || result.saved || parsedQuestions.length || databaseQuestions.length;
            showToast(`${syncedCount} questions synced with database!`, 'success');

            // Update filters after syncing
            updateSubjectFilters();
            updateYearFilters();
            updateDifficultyFilters();
        } else {
            showToast(result.message || 'Failed to sync with database', 'error');
        }
    } catch (error) {
        console.error('Error syncing with database:', error);
        showToast('Error syncing with database: ' + error.message, 'error');
    }
}

// ==================== CONFIRM MODAL FUNCTIONS ====================
function showConfirmModal(title, message, callback) {
    document.getElementById('confirmModalTitle').textContent = title;
    document.getElementById('confirmModalMessage').innerHTML = message;
    confirmModalCallback = callback;
    document.getElementById('confirmModal').classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    confirmModalCallback = null;
}

function confirmModalAction() {
    if (confirmModalCallback) {
        confirmModalCallback();
    }
    closeConfirmModal();
}

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

// ==================== EVENT LISTENERS FOR FILTERS ====================
document.addEventListener('DOMContentLoaded', function () {
    // Add event listeners for filter changes
    const subjectFilter = document.getElementById('filterSubject');
    const yearFilter = document.getElementById('filterYear');
    const difficultyFilter = document.getElementById('filterDifficulty');
    const searchInput = document.getElementById('searchQuestions');

    if (subjectFilter) subjectFilter.addEventListener('change', updateQuestionsList);
    if (yearFilter) yearFilter.addEventListener('change', updateQuestionsList);
    if (difficultyFilter) difficultyFilter.addEventListener('change', updateQuestionsList);
    if (searchInput) searchInput.addEventListener('input', updateQuestionsList);

    // Initialize tab functionality
    initializeTabs();

    // Load questions when page loads
    loadQuestionsFromAPI();
});