// File: CodingTerminals-TestSeries/admin/question-upload.js

// Global Variables
let uploadedFiles = [];
let parsedQuestions = [];
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
function updateFilePreview() {
    const filesList = document.getElementById('filesList');
    if (!filesList) return; // Safe check

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
async function loadQuestionsFromAPI() {
    try {
        const response = await fetch(API_URLS.GET_ALL_QUESTIONS);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            parsedQuestions = result.data || [];
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

// Update questions list display
function updateQuestionsList() {
    const container = document.getElementById('questionsContainer');
    const emptyState = document.getElementById('emptyState');
    const questionCount = document.getElementById('questionCount');

    if (!container || !emptyState || !questionCount) return; // Safe checks

    if (parsedQuestions.length === 0) {
        emptyState.style.display = 'block';
        container.innerHTML = '';
        questionCount.textContent = '0';
        return;
    }

    emptyState.style.display = 'none';
    questionCount.textContent = parsedQuestions.length;

    // Apply filters
    const filteredQuestions = applyFilters();

    container.innerHTML = filteredQuestions.map((question, index) => `
        <div class="question-preview">
            <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 mb-2">${question.question}</h4>
                    <div class="flex flex-wrap gap-2 mb-2">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${question.subject}</span>
                        <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">${question.academicYear}</span>
                        <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">${question.examType}</span>
                        <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">${question.difficulty}</span>
                        <span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">${question.topic}</span>
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
                ${question.options.map((option, optIndex) => `
                    <div class="question-option ${optIndex === question.correctAnswer ? 'correct-answer' : ''}">
                        <label class="flex items-center">
                            <input type="radio" disabled ${optIndex === question.correctAnswer ? 'checked' : ''}>
                            <span class="ml-2">${String.fromCharCode(65 + optIndex)}. ${option}</span>
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

// Apply filters to questions
function applyFilters() {
    const subjectFilter = document.getElementById('filterSubject');
    const yearFilter = document.getElementById('filterYear');
    const difficultyFilter = document.getElementById('filterDifficulty');
    const searchQuery = document.getElementById('searchQuestions');

    if (!subjectFilter || !yearFilter || !difficultyFilter || !searchQuery) return parsedQuestions;

    const subjectValue = subjectFilter.value;
    const yearValue = yearFilter.value;
    const difficultyValue = difficultyFilter.value;
    const searchValue = searchQuery.value.toLowerCase();

    return parsedQuestions.filter(question => {
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

// Edit question
function editQuestion(index) {
    currentEditingQuestion = index;
    const question = parsedQuestions[index];

    // Create edit modal or use inline editing
    showEditModal(question, index);
}

// Show edit modal
function showEditModal(question, index) {
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
                        <textarea id="editQuestionText" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" rows="3">${question.question}</textarea>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                            <select id="editSubject" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
                                ${Array.from(subjectList).map(subj => `<option value="${subj}" ${subj === question.subject ? 'selected' : ''}>${subj}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                            <input type="text" id="editYear" value="${question.academicYear}" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none">
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
                                ${difficultyLevels.map(level => `<option value="${level}" ${level === question.difficulty ? 'selected' : ''}>${level}</option>`).join('')}
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
                            ${question.options.map((option, optIndex) => `
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

// ... existing code ...

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

// ... rest of existing code ...

// Save edited question
async function saveEditedQuestion(index) {
    const question = parsedQuestions[index];

    // Get updated values
    const updatedQuestion = {
        id: question.id,
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
    updatedQuestion.options = Array.from(optionElements).map(el => el.value);

    // Update correct answer
    const correctAnswerRadio = document.querySelector('input[name="correctAnswer"]:checked');
    if (correctAnswerRadio) {
        updatedQuestion.correctAnswer = parseInt(correctAnswerRadio.value);
    }

    try {
        // Make API call to update question
        const response = await fetch(API_URLS.UPDATE_QUESTION(question.id), {
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
            updateQuestionsList();
            updateSubjectFilters();
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
        modal.remove();
    }
}

// Delete question
async function deleteQuestion(index) {
    const question = parsedQuestions[index];

    showConfirmModal('Delete Question', 'Are you sure you want to delete this question? This action cannot be undone.', async () => {
        try {
            // Make API call to delete question
            const response = await fetch(API_URLS.DELETE_QUESTION(question.id), {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // Remove from local array
                parsedQuestions.splice(index, 1);
                updateQuestionsList();
                showToast('Question deleted successfully!', 'success');
            } else {
                showToast(result.message || 'Failed to delete question', 'error');
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

// Handle file import
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
        showToast(`Processing ${fileName}...`, 'info');

        // Prepare form data
        const formData = new FormData();
        formData.append('file', file);
        formData.append('subject', document.getElementById('subjectSelect').value || '');
        formData.append('academicYear', document.getElementById('academicYear').value || '');
        formData.append('examType', document.getElementById('examType').value || 'Practice Paper');
        formData.append('difficulty', document.getElementById('difficultyLevel').value || 'Intermediate');

        // Choose appropriate endpoint
        let apiUrl;
        switch (importType) {
            case 'csv':
                apiUrl = API_URLS.IMPORT_CSV;
                break;
            case 'excel':
                apiUrl = API_URLS.IMPORT_EXCEL;
                break;
            case 'text':
            default:
                apiUrl = API_URLS.IMPORT_TEXT;
                break;
        }

        // Make API call
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success && result.questions && result.questions.length > 0) {
            parsedQuestions = [...parsedQuestions, ...result.questions];
            updateQuestionsList();
            updateSubjectFilters();
            updateYearFilters();
            updateDifficultyFilters();
            showToast(`${result.questions.length} questions imported from ${fileName}!`, 'success');
        } else {
            showToast(result.message || 'No questions found in the file', 'warning');
        }
    } catch (error) {
        console.error('Error importing file:', error);
        showToast('Error importing file: ' + error.message, 'error');
    }
}

// Save all questions to backend
async function saveAllQuestions() {
    if (parsedQuestions.length === 0) {
        showToast('No questions to save', 'warning');
        return;
    }

    try {
        showToast('Saving all questions...', 'info');

        // Make API call to save all questions
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
            showToast(`${result.count || parsedQuestions.length} questions saved successfully!`, 'success');
        } else {
            showToast(result.message || 'Failed to save questions', 'error');
        }
    } catch (error) {
        console.error('Error saving questions:', error);
        showToast('Error saving questions: ' + error.message, 'error');
    }
}

// Sync with MongoDB
async function syncWithMongoDB() {
    if (parsedQuestions.length === 0) {
        showToast('No questions to sync', 'warning');
        return;
    }

    try {
        showToast('Syncing with database...', 'info');

        // Make API call to sync with database
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
            showToast(`${result.synced || parsedQuestions.length} questions synced with database!`, 'success');
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

    // Load questions when page loads
    loadQuestionsFromAPI();
});