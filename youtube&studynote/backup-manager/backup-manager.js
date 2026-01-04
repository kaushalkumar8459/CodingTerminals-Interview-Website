// ==================== CENTRALIZED BACKUP MANAGER ====================
// Handles backup operations for both Study Notes and YouTube Roadmap
// UPDATED: Works directly with MongoDB collections only (No IndexedDB)

let currentModule = null;
let currentEndpoint = null;
let confirmCallback = null;

// Module Configuration - MongoDB collections only
const MODULE_CONFIG = {
    studyNotes: {
        name: 'Study Notes',
        endpoint: '/api/notes',
        backupEndpoint: '/api/notes/backup',
        icon: '📝',
        itemLabel: 'Notes',
        mongoCollection: 'studyNotes',
        backupCollections: {
            active: 'studyNotes',
            temp: 'studyNotes_backup_temp',
            final: 'studyNotes_backup_final'
        }
    },
    youtubeRoadmap: {
        name: 'YouTube Roadmap',
        endpoint: '/api/videos',
        backupEndpoint: '/api/videos/backup',
        icon: '🎬',
        itemLabel: 'Videos',
        mongoCollection: 'youtubeVideos',
        // Related collections that should be backed up together
        relatedCollections: [
            {
                name: 'interviewQuestions',
                backupCollections: {
                    active: 'interviewQuestions',
                    temp: 'interviewQuestions_backup_temp',
                    final: 'interviewQuestions_backup_final'
                }
            }
        ],
        backupCollections: {
            active: 'youtubeVideos',
            temp: 'youtubeVideos_backup_temp',
            final: 'youtubeVideos_backup_final'
        }
    }
};

// ==================== MODULE SELECTION ====================

/**
 * Select which module to manage (Study Notes or YouTube Roadmap)
 */
async function selectModule(moduleName) {
    currentModule = moduleName;
    const config = MODULE_CONFIG[moduleName];
    currentEndpoint = config.endpoint;
    
    // Update UI
    document.getElementById('moduleTitle').innerHTML = `${config.icon} ${config.name} - Backup Status`;
    document.getElementById('backupSection').classList.remove('hidden');
    
    // Update button states
    document.getElementById('btnStudyNotes').classList.remove('border-purple-500', 'bg-purple-100');
    document.getElementById('btnYoutubeRoadmap').classList.remove('border-red-500', 'bg-red-100');
    
    if (moduleName === 'studyNotes') {
        document.getElementById('btnStudyNotes').classList.add('border-purple-500', 'bg-purple-100');
    } else {
        document.getElementById('btnYoutubeRoadmap').classList.add('border-red-500', 'bg-red-100');
    }
    
    // Load backup status
    await loadBackupStatus();
    
    showToast(`✅ Switched to ${config.name}`, 'success');
}

// ==================== BACKUP STATUS ====================

/**
 * Load backup status for all MongoDB collections
 */
async function loadBackupStatus() {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    try {
        // Show spinners in status cards
        showSpinner('activeStatus', 'Loading...', 'sm');
        showSpinner('tempStatus', 'Loading...', 'sm');
        showSpinner('finalStatus', 'Loading...', 'sm');
        
        const config = MODULE_CONFIG[currentModule];
        
        // Get counts from MongoDB backup collections
        const activeData = await getBackupData('active');
        const tempData = await getBackupData('temp');
        const finalData = await getBackupData('final');
        
        // Update Active Collection Status
        updateStatusCard('activeStatus', {
            exists: activeData.length > 0,
            count: activeData.length,
            lastUpdated: activeData[0]?.updatedAt || new Date().toISOString()
        }, config.itemLabel);
        
        // Update Temp Collection Status
        updateStatusCard('tempStatus', {
            exists: tempData.length > 0,
            count: tempData.length,
            lastUpdated: tempData[0]?.updatedAt || null
        }, config.itemLabel);
        
        // Update Final Collection Status
        updateStatusCard('finalStatus', {
            exists: finalData.length > 0,
            count: finalData.length,
            lastUpdated: finalData[0]?.updatedAt || null
        }, config.itemLabel);
        
        showToast('✅ Backup status loaded!', 'success');
    } catch (error) {
        console.error('Error loading backup status:', error);
        showToast('❌ Error loading backup status', 'error');
    }
}

/**
 * Update a status card with collection data
 */
function updateStatusCard(elementId, statusData, itemLabel) {
    const element = document.getElementById(elementId);
    
    if (statusData.exists) {
        element.innerHTML = `
            <div class="flex justify-between text-lg">
                <span>Items:</span>
                <span class="font-bold">${statusData.count}</span>
            </div>
            <div class="text-xs ${elementId === 'activeStatus' ? 'text-green-700' : elementId === 'tempStatus' ? 'text-yellow-700' : 'text-blue-700'}">
                Last updated: <span class="font-semibold">${statusData.lastUpdated ? new Date(statusData.lastUpdated).toLocaleString() : 'N/A'}</span>
            </div>
        `;
    } else {
        const color = elementId === 'activeStatus' ? 'text-green-700' : elementId === 'tempStatus' ? 'text-yellow-700' : 'text-blue-700';
        element.innerHTML = `<div class="${color} text-sm">No data</div>`;
    }
}

// ==================== MONGODB BACKUP OPERATIONS ====================

/**
 * Get backup data from MongoDB collection (including related collections)
 */
async function getBackupData(collectionType) {
    const config = MODULE_CONFIG[currentModule];
    const collectionName = config.backupCollections[collectionType];
    
    try {
        const response = await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${collectionName}`);
        if (!response.ok) {
            if (response.status === 404) return [];
            throw new Error('Failed to fetch backup data');
        }
        const mainData = await response.json();
        
        // For YouTube Roadmap, also count related interview questions
        if (currentModule === 'youtubeRoadmap' && config.relatedCollections) {
            const relatedCollection = config.relatedCollections[0];
            const relatedCollectionName = relatedCollection.backupCollections[collectionType];
            
            try {
                const relatedResponse = await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${relatedCollectionName}`);
                if (relatedResponse.ok) {
                    const relatedData = await relatedResponse.json();
                    console.log(`📊 ${collectionName}: ${mainData.length} videos, ${relatedCollectionName}: ${relatedData.length} questions`);
                }
            } catch (err) {
                console.warn('Could not fetch related collection:', err);
            }
        }
        
        return mainData;
    } catch (error) {
        console.error(`Error fetching ${collectionType} data:`, error);
        return [];
    }
}

/**
 * Save data to a specific MongoDB collection by name
 */
async function saveToSpecificCollection(collectionName, data) {
    const config = MODULE_CONFIG[currentModule];
    
    const response = await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${collectionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error(`Failed to save data to ${collectionName}`);
    
    return await response.json();
}

/**
 * Save backup data to MongoDB collection (including related collections)
 */
async function saveBackupData(collectionType, data) {
    const config = MODULE_CONFIG[currentModule];
    const collectionName = config.backupCollections[collectionType];
    
    // Save main collection
    const response = await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${collectionName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) throw new Error('Failed to save backup data');
    
    // For YouTube Roadmap, check if we need to update related interview questions
    // IMPORTANT: Only auto-sync interview questions when copying between collections,
    // NOT when deleting individual items from a specific collection
    if (currentModule === 'youtubeRoadmap' && config.relatedCollections && !currentActiveTab) {
        const relatedCollection = config.relatedCollections[0];
        const relatedCollectionName = relatedCollection.backupCollections[collectionType];
        const sourceRelatedName = relatedCollection.backupCollections.active;
        
        try {
            // Fetch interview questions from active collection
            const questionsResponse = await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${sourceRelatedName}`);
            if (questionsResponse.ok) {
                const questionsData = await questionsResponse.json();
                
                // Save to backup collection
                await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${relatedCollectionName}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(questionsData)
                });
                
                console.log(`✅ Also backed up ${questionsData.length} interview questions to ${relatedCollectionName}`);
            }
        } catch (err) {
            console.warn('⚠️ Could not backup related collection:', err);
        }
    }
    
    return await response.json();
}

/**
 * Clear backup data from MongoDB collection (including related collections)
 */
async function clearBackupData(collectionType) {
    const config = MODULE_CONFIG[currentModule];
    const collectionName = config.backupCollections[collectionType];
    
    // Clear main collection
    const response = await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${collectionName}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to clear backup data');
    
    // For YouTube Roadmap, also clear related interview questions
    if (currentModule === 'youtubeRoadmap' && config.relatedCollections) {
        const relatedCollection = config.relatedCollections[0];
        const relatedCollectionName = relatedCollection.backupCollections[collectionType];
        
        try {
            await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${relatedCollectionName}`, {
                method: 'DELETE'
            });
            console.log(`✅ Also cleared interview questions from ${relatedCollectionName}`);
        } catch (err) {
            console.warn('⚠️ Could not clear related collection:', err);
        }
    }
    
    return await response.json();
}

// ==================== DATA MIGRATION ====================

/**
 * Copy data between MongoDB collections
 */
async function copyData(from, to) {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    const collectionNames = {
        'active': 'Working Copy',
        'temp': "Today's Backup",
        'final': 'Permanent Save'
    };
    
    const config = MODULE_CONFIG[currentModule];
    const message = `Are you sure you want to copy ${config.name} data from ${collectionNames[from]} to ${collectionNames[to]}?\n\nThis will overwrite any existing data in ${collectionNames[to]}.`;
    
    showConfirmModal(
        `🔄 Copy ${collectionNames[from]} → ${collectionNames[to]}`,
        message,
        async () => {
            try {
                showToast(`⏳ Copying data from ${collectionNames[from]} to ${collectionNames[to]}...`, 'info');
                
                // Get source data from MongoDB
                const sourceData = await getBackupData(from);
                
                if (!sourceData || sourceData.length === 0) {
                    throw new Error(`No data found in ${collectionNames[from]}`);
                }
                
                // Save to destination MongoDB collection
                await saveBackupData(to, sourceData);
                showToast(`✅ Successfully copied ${sourceData.length} items from ${collectionNames[from]} to ${collectionNames[to]}!`, 'success');
                
                // Reload backup status
                await loadBackupStatus();
            } catch (error) {
                console.error('Error copying data:', error);
                showToast(`❌ Error: ${error.message}`, 'error');
            }
        }
    );
}

// ==================== EXPORT OPERATIONS ====================

/**
 * Export collection data as JSON file
 */
async function exportCollection(collectionType) {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    try {
        const config = MODULE_CONFIG[currentModule];
        const collectionNames = {
            'active': 'working',
            'temp': 'temp',
            'final': 'final'
        };
        
        showToast(`📥 Exporting ${collectionNames[collectionType]} collection...`, 'info');
        
        // Get data from MongoDB
        const data = await getBackupData(collectionType);
        
        if (!data || data.length === 0) {
            showToast('⚠️ No data to export', 'warning');
            return;
        }
        
        // Download as JSON file
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentModule}_${collectionNames[collectionType]}_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast(`✅ Exported ${data.length} items!`, 'success');
    } catch (error) {
        console.error('Error exporting collection:', error);
        showToast('❌ Error exporting collection', 'error');
    }
}

// ==================== CLEAR OPERATIONS ====================

/**
 * Clear a MongoDB collection
 */
async function clearCollection(collectionType) {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    const collectionNames = {
        'active': 'Working Copy',
        'temp': "Today's Backup",
        'final': 'Permanent Save'
    };
    
    const config = MODULE_CONFIG[currentModule];
    const warningLevel = collectionType === 'active' ? '⚠️ DANGER' : '⚠️ Warning';
    const message = collectionType === 'active' 
        ? `🚨 THIS WILL DELETE ALL YOUR CURRENT ${config.name.toUpperCase()} DATA! 🚨\n\nAre you absolutely sure you want to clear the Working Copy?\n\nThis action cannot be undone!\n\nConsider backing up first.`
        : `Are you sure you want to clear the ${collectionNames[collectionType]} for ${config.name}?\n\nThis action cannot be undone.`;
    
    showConfirmModal(
        `${warningLevel}: Clear ${collectionNames[collectionType]}`,
        message,
        async () => {
            try {
                showToast(`⏳ Clearing ${collectionNames[collectionType]}...`, 'info');
                
                // Clear MongoDB collection
                await clearBackupData(collectionType);
                showToast(`✅ ${collectionNames[collectionType]} cleared!`, 'success');
                
                // Reload backup status
                await loadBackupStatus();
            } catch (error) {
                console.error('Error clearing collection:', error);
                showToast(`❌ Error: ${error.message}`, 'error');
            }
        }
    );
}

// ==================== UI HELPERS ====================

/**
 * Show inline spinner in a specific element
 */
function showSpinner(elementId, message = 'Loading...', size = 'md') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const spinnerHtml = `
        <div class="spinner-container">
            <div class="spinner-${size} spinner-primary"></div>
            <span class="text-gray-600">${message}</span>
        </div>
    `;
    element.innerHTML = spinnerHtml;
}

/**
 * Hide spinner and show content
 */
function hideSpinner(elementId, content = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.innerHTML = content;
}

/**
 * Add loading overlay to a section
 */
function addLoadingOverlay(elementId, message = 'Loading...', isDark = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Make parent relative if not already
    if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
    }
    
    const overlay = document.createElement('div');
    overlay.className = `loading-overlay ${isDark ? 'dark' : ''}`;
    overlay.id = `${elementId}-overlay`;
    overlay.innerHTML = `
        <div class="text-center">
            <div class="spinner-lg spinner-primary mb-3"></div>
            <div class="${isDark ? 'text-white' : 'text-gray-700'} font-semibold">${message}</div>
        </div>
    `;
    
    element.appendChild(overlay);
}

/**
 * Remove loading overlay from a section
 */
function removeLoadingOverlay(elementId) {
    const overlay = document.getElementById(`${elementId}-overlay`);
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Show loading dots in button
 */
function showButtonSpinner(buttonElement, originalText = '') {
    if (!buttonElement) return;
    
    buttonElement.disabled = true;
    buttonElement.dataset.originalText = originalText || buttonElement.textContent;
    buttonElement.innerHTML = `
        <span class="spinner-sm spinner-white"></span>
        <span class="ml-2">Processing...</span>
    `;
}

/**
 * Hide button spinner and restore original text
 */
function hideButtonSpinner(buttonElement) {
    if (!buttonElement) return;
    
    buttonElement.disabled = false;
    const originalText = buttonElement.dataset.originalText || 'Submit';
    buttonElement.textContent = originalText;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };
    
    toast.className = `${colors[type]} text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 min-w-[300px] animate-slide-in`;
    toast.innerHTML = `
        <span class="text-xl">${icons[type]}</span>
        <span class="flex-1">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slide-out 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show confirmation modal
 */
function showConfirmModal(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const modalTitle = document.getElementById('confirmModalTitle');
    const modalMessage = document.getElementById('confirmModalMessage');
    
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmCallback = onConfirm;
    
    modal.classList.remove('hidden');
}

/**
 * Close confirmation modal
 */
function closeModal() {
    const modal = document.getElementById('confirmModal');
    modal.classList.add('hidden');
    confirmCallback = null;
}

/**
 * Confirm modal action
 */
function confirmAction() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeModal();
}

/**
 * Logout function
 */
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = '../auth/login.html';
    }
}

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('confirmModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Initialize backup DB on page load
window.addEventListener('load', async () => {
    showToast('👋 Welcome! Please select a module to begin', 'info');
});

// ==================== COLLECTION DETAILS VIEWER ====================

let currentViewData = {}; // Store data for download
let currentActiveTab = null;
let selectedItems = new Set(); // Track selected items for bulk delete
let currentCollectionType = null; // Track current collection type being viewed
let currentPage = 1; // Current page number
let itemsPerPage = 20; // Items per page

/**
 * Helper function to get MongoDB _id as string
 */
function getMongoId(item) {
    if (!item._id) return null;
    
    // If _id is an object with $oid (MongoDB format)
    if (typeof item._id === 'object' && item._id.$oid) {
        return item._id.$oid;
    }
    
    // If _id is already a string
    if (typeof _id === 'string') {
        return item._id;
    }
    
    // If _id is an ObjectId, convert to string
    return String(item._id);
}

/**
 * Helper function to generate consistent item ID across all operations
 */
function getItemId(item, index) {
    // ALWAYS prefer MongoDB _id - it's unique and guaranteed
    const mongoId = getMongoId(item);
    if (mongoId) {
        return mongoId;
    }
    
    // Fallback only if _id doesn't exist (should never happen with MongoDB data)
    console.warn('Item without _id found, using fallback ID generation', item);
    return `fallback_${index}_${Date.now()}`;
}

/**
 * View collection details in a modal popup
 */
async function viewCollectionDetails(collectionType) {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    try {
        currentCollectionType = collectionType; // Store collection type
        selectedItems.clear(); // Clear previous selections
        currentPage = 1; // Reset to page 1
        
        const config = MODULE_CONFIG[currentModule];
        const collectionNames = {
            'active': 'Working Copy',
            'temp': "Today's Backup",
            'final': 'Permanent Save'
        };
        
        console.log('🔍 VIEW COLLECTION DETAILS - START');
        console.log('Collection type:', collectionType);
        console.log('Module:', currentModule);
        
        // Show modal
        document.getElementById('detailsModal').classList.remove('hidden');
        document.getElementById('detailsModalTitle').textContent = `📊 ${collectionNames[collectionType]} - ${config.name}`;
        document.getElementById('detailsModalSubtitle').textContent = 'Loading collection data...';
        
        // Reset content
        document.getElementById('detailsModalContent').innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <div class="text-4xl mb-2">⏳</div>
                <div>Loading data...</div>
            </div>
        `;
        
        // Fetch main collection data
        const mainCollectionName = config.backupCollections[collectionType];
        console.log('📥 Fetching main collection:', mainCollectionName);
        const mainData = await getBackupData(collectionType);
        console.log('✅ Main collection fetched:', mainData.length, 'items');
        
        currentViewData = {
            [mainCollectionName]: mainData
        };
        
        // For YouTube Roadmap, also fetch interview questions
        if (currentModule === 'youtubeRoadmap' && config.relatedCollections) {
            const relatedCollection = config.relatedCollections[0];
            const relatedCollectionName = relatedCollection.backupCollections[collectionType];
            
            console.log('📥 Fetching related collection:', relatedCollectionName);
            
            try {
                const relatedResponse = await fetch(`${APP_CONFIG.API.BASE_URL}${config.backupEndpoint}/${relatedCollectionName}`);
                console.log('📡 Related API response status:', relatedResponse.status);
                
                if (relatedResponse.ok) {
                    const relatedData = await relatedResponse.json();
                    console.log('✅ Related collection fetched:', relatedData.length, 'items');
                    console.log('📊 Sample of first item:', relatedData[0]);
                    
                    currentViewData[relatedCollectionName] = relatedData;
                    console.log('✅ Stored in currentViewData[' + relatedCollectionName + ']:', currentViewData[relatedCollectionName].length, 'items');
                } else {
                    console.warn('⚠️ Related API response not OK:', relatedResponse.statusText);
                }
            } catch (err) {
                console.error('❌ Could not fetch related collection:', err);
            }
        }
        
        console.log('📊 Total collections in currentViewData:', Object.keys(currentViewData).length);
        Object.keys(currentViewData).forEach(key => {
            console.log(`   - ${key}: ${currentViewData[key].length} items`);
        });
        
        // IMPORTANT: Render tabs FIRST to set currentActiveTab intelligently
        // This ensures we show interview questions by default (largest dataset)
        renderCollectionTabs(Object.keys(currentViewData));
        
        // Then render the data using the intelligently selected tab
        console.log('📊 Selected tab for rendering:', currentActiveTab);
        renderCollectionData(currentActiveTab);
        
        // Update subtitle with stats
        const totalItems = Object.values(currentViewData).reduce((sum, data) => sum + data.length, 0);
        document.getElementById('detailsModalSubtitle').textContent = `Total: ${totalItems} items across ${Object.keys(currentViewData).length} collection(s)`;
        
        console.log('✅ VIEW COLLECTION DETAILS - COMPLETE');
        console.log('📊 Final currentActiveTab:', currentActiveTab);
        console.log('📊 Final item count:', currentViewData[currentActiveTab]?.length);
        
    } catch (error) {
        console.error('❌ Error loading collection details:', error);
        document.getElementById('detailsModalContent').innerHTML = `
            <div class="text-center text-red-500 py-8">
                <div class="text-4xl mb-2">❌</div>
                <div>Error loading data: ${error.message}</div>
            </div>
        `;
    }
}

/**
 * Render tabs for multiple collections
 */
function renderCollectionTabs(collectionNames) {
    const tabsContainer = document.getElementById('collectionTabs');
    
    if (collectionNames.length === 1) {
        tabsContainer.innerHTML = '';
        currentActiveTab = collectionNames[0];
        return;
    }
    
    // If currentActiveTab is not set OR not in the current collection names, set it intelligently
    if (!currentActiveTab || !collectionNames.includes(currentActiveTab)) {
        // Prefer interview questions for temp/final backups (larger dataset)
        const interviewQuestionsTab = collectionNames.find(name => name.includes('interviewQuestions'));
        currentActiveTab = interviewQuestionsTab || collectionNames[0];
    }
    
    tabsContainer.innerHTML = collectionNames.map(name => {
        const displayName = name.includes('interviewQuestions') ? '💼 Interview Questions' : '🎬 Videos';
        const count = currentViewData[name]?.length || 0;
        
        return `
            <button 
                onclick="switchCollectionTab('${name}')" 
                id="tab-${name}"
                class="px-6 py-3 font-semibold rounded-t-lg transition-all ${currentActiveTab === name ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}">
                ${displayName} (${count})
            </button>
        `;
    }).join('');
}

/**
 * Switch between collection tabs
 */
function switchCollectionTab(collectionName) {
    currentActiveTab = collectionName;
    renderCollectionTabs(Object.keys(currentViewData));
    renderCollectionData(collectionName);
}

/**
 * Render collection data in a table format with pagination
 */
function renderCollectionData(collectionName) {
    const data = currentViewData[collectionName] || [];
    const contentContainer = document.getElementById('detailsModalContent');
    const statsContainer = document.getElementById('detailsModalStats');
    
    // Reset to page 1 when switching tabs
    if (!currentPage) currentPage = 1;
    
    console.log(`🔍 RENDER COLLECTION DATA - START`);
    console.log(`Collection Name: ${collectionName}`);
    console.log(`Total Data Length: ${data.length}`);
    console.log(`Items Per Page: ${itemsPerPage}`);
    console.log(`Current Page: ${currentPage}`);
    
    if (data.length === 0) {
        contentContainer.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <div class="text-4xl mb-2">📭</div>
                <div class="text-lg font-semibold">No data in this collection</div>
                <div class="text-sm mt-2">Collection: <code class="bg-gray-200 px-2 py-1 rounded">${collectionName}</code></div>
            </div>
        `;
        statsContainer.innerHTML = `<span>Collection: <strong>${collectionName}</strong> | Items: <strong>0</strong></span>`;
        return;
    }
    
    // Calculate pagination - CRITICAL: Use actual data.length for this specific collection
    const actualDataLength = data.length;
    const totalPages = Math.ceil(actualDataLength / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, actualDataLength);
    const paginatedData = data.slice(startIndex, endIndex);
    
    console.log(`📊 Pagination Calculation:`);
    console.log(`   - Actual Data Length: ${actualDataLength}`);
    console.log(`   - Total Pages: ${totalPages}`);
    console.log(`   - Start Index: ${startIndex}`);
    console.log(`   - End Index: ${endIndex}`);
    console.log(`   - Paginated Data Length: ${paginatedData.length}`);
    console.log(`   - Showing: ${startIndex + 1}-${endIndex} of ${actualDataLength}`);
    
    // Detect collection type
    const isInterviewQuestions = collectionName.includes('interviewQuestions');
    const isVideo = collectionName.includes('youtubeVideos') || data[0]?.videoId;
    const isNote = collectionName.includes('studyNotes') || data[0]?.noteId;
    
    let html = `
        <!-- Delete Toolbar -->
        <div class="mb-4 flex gap-3 flex-wrap items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
            <button onclick="toggleSelectAllOnPage()" class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all">
                <span id="selectAllText">✓ Select Page</span>
            </button>
            <button onclick="deleteSelected()" class="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all">
                🗑️ Delete Selected (<span id="selectedCount">0</span>)
            </button>
            <button onclick="toggleFilterPanel()" class="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-all">
                🔍 Filter & Delete
            </button>
            
            <!-- Items Per Page Selector -->
            <select id="itemsPerPageSelect" onchange="changeItemsPerPage()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="10" ${itemsPerPage === 10 ? 'selected' : ''}>10 per page</option>
                <option value="20" ${itemsPerPage === 20 ? 'selected' : ''}>20 per page</option>
                <option value="50" ${itemsPerPage === 50 ? 'selected' : ''}>50 per page</option>
                <option value="100" ${itemsPerPage === 100 ? 'selected' : ''}>100 per page</option>
                <option value="${actualDataLength}">All (${actualDataLength})</option>
            </select>
            
            <span class="text-sm text-gray-600 ml-auto">
                Showing <strong>${startIndex + 1}-${endIndex}</strong> of <strong>${actualDataLength}</strong> items
            </span>
        </div>
        
        <!-- Filter Panel (Hidden by default) -->
        <div id="filterPanel" class="hidden mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 class="font-bold text-lg mb-3 text-yellow-900">🔍 Filter & Bulk Delete</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                ${isVideo ? `
                    <input type="text" id="filterVideoId" placeholder="Filter by Video ID..." class="px-3 py-2 border border-gray-300 rounded-lg">
                    <input type="text" id="filterTitle" placeholder="Filter by Title..." class="px-3 py-2 border border-gray-300 rounded-lg">
                ` : isNote ? `
                    <input type="text" id="filterTitle" placeholder="Filter by Title..." class="px-3 py-2 border border-gray-300 rounded-lg">
                    <input type="text" id="filterCategory" placeholder="Filter by Category..." class="px-3 py-2 border border-gray-300 rounded-lg">
                ` : isInterviewQuestions ? `
                    <input type="text" id="filterVideoId" placeholder="Filter by Video ID..." class="px-3 py-2 border border-gray-300 rounded-lg">
                    <select id="filterDifficulty" class="px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                ` : ''}
            </div>
            <div class="flex gap-2">
                <button onclick="applyFilter()" class="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all">
                    Apply Filter
                </button>
                <button onclick="deleteFiltered()" class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all">
                    🗑️ Delete Filtered Items
                </button>
                <button onclick="clearFilter()" class="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all">
                    Clear Filter
                </button>
            </div>
        </div>
        
        <div class="overflow-x-auto">`;
    
    if (isInterviewQuestions) {
        // Render Interview Questions table - PAGINATED
        html += `
            <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead class="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <tr>
                        <th class="px-4 py-3 text-center text-sm font-bold">
                            <input type="checkbox" onchange="toggleSelectAllOnPage()" id="selectAllCheckbox" class="w-4 h-4 cursor-pointer">
                        </th>
                        <th class="px-4 py-3 text-left text-sm font-bold">#</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Video ID</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Question</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Answer</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Difficulty</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Updated</th>
                        <th class="px-4 py-3 text-center text-sm font-bold">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedData.map((item, pageIndex) => {
                        const actualIndex = startIndex + pageIndex;
                        const itemId = getItemId(item, actualIndex);
                        return `
                        <tr class="border-t border-gray-200 hover:bg-gray-50" data-item-id="${itemId}">
                            <td class="px-4 py-3 text-center">
                                <input type="checkbox" onchange="toggleItemSelection('${itemId}')" class="item-checkbox w-4 h-4 cursor-pointer" ${selectedItems.has(itemId) ? 'checked' : ''}>
                            </td>
                            <td class="px-4 py-3 text-sm font-semibold text-gray-700">${actualIndex + 1}</td>
                            <td class="px-4 py-3 text-sm">
                                <code class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">${item.videoId || 'N/A'}</code>
                            </td>
                            <td class="px-4 py-3 text-sm max-w-md">
                                <div class="line-clamp-2" title="${item.question || 'No question'}">${stripHtml(item.question || 'No question')}</div>
                            </td>
                            <td class="px-4 py-3 text-sm max-w-md">
                                <div class="line-clamp-2 text-gray-600" title="${item.answer || 'No answer'}">${stripHtml(item.answer || 'No answer')}</div>
                            </td>
                            <td class="px-4 py-3 text-sm">
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(item.difficulty)}">${item.difficulty || 'N/A'}</span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-500">${formatDate(item.updatedAt)}</td>
                            <td class="px-4 py-3 text-center">
                                <button onclick="deleteSingleItem('${itemId}')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        `;
    } else if (isVideo) {
        // Render Videos table - PAGINATED
        html += `
            <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead class="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                    <tr>
                        <th class="px-4 py-3 text-center text-sm font-bold">
                            <input type="checkbox" onchange="toggleSelectAllOnPage()" id="selectAllCheckbox" class="w-4 h-4 cursor-pointer">
                        </th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Day</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Title</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Video ID</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Subtopics</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Date</th>
                        <th class="px-4 py-3 text-center text-sm font-bold">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedData.map((item, pageIndex) => {
                        const actualIndex = startIndex + pageIndex;
                        const itemId = getItemId(item, actualIndex);
                        return `
                        <tr class="border-t border-gray-200 hover:bg-gray-50" data-item-id="${itemId}">
                            <td class="px-4 py-3 text-center">
                                <input type="checkbox" onchange="toggleItemSelection('${itemId}')" class="item-checkbox w-4 h-4 cursor-pointer" ${selectedItems.has(itemId) ? 'checked' : ''}>
                            </td>
                            <td class="px-4 py-3 text-sm font-bold text-purple-600">${item.day || actualIndex + 1}</td>
                            <td class="px-4 py-3 text-sm font-semibold max-w-md">
                                <div class="line-clamp-2">${item.title || 'Untitled'}</div>
                            </td>
                            <td class="px-4 py-3 text-sm">
                                <code class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">${item.videoId || 'N/A'}</code>
                            </td>
                            <td class="px-4 py-3 text-sm max-w-xs">
                                <div class="text-gray-600">${(item.subtopics || []).length} topics</div>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-500">${item.date || formatDate(item.createdAt)}</td>
                            <td class="px-4 py-3 text-center">
                                <button onclick="deleteSingleItem('${itemId}')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        `;
    } else if (isNote) {
        // Render Notes table - PAGINATED
        html += `
            <table class="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead class="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                    <tr>
                        <th class="px-4 py-3 text-center text-sm font-bold">
                            <input type="checkbox" onchange="toggleSelectAllOnPage()" id="selectAllCheckbox" class="w-4 h-4 cursor-pointer">
                        </th>
                        <th class="px-4 py-3 text-left text-sm font-bold">#</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Title</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Category</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Tags</th>
                        <th class="px-4 py-3 text-left text-sm font-bold">Date</th>
                        <th class="px-4 py-3 text-center text-sm font-bold">Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${paginatedData.map((item, pageIndex) => {
                        const actualIndex = startIndex + pageIndex;
                        const itemId = getItemId(item, actualIndex);
                        return `
                        <tr class="border-t border-gray-200 hover:bg-gray-50" data-item-id="${itemId}">
                            <td class="px-4 py-3 text-center">
                                <input type="checkbox" onchange="toggleItemSelection('${itemId}')" class="item-checkbox w-4 h-4 cursor-pointer" ${selectedItems.has(itemId) ? 'checked' : ''}>
                            </td>
                            <td class="px-4 py-3 text-sm font-semibold text-gray-700">${actualIndex + 1}</td>
                            <td class="px-4 py-3 text-sm font-semibold max-w-md">
                                <div class="line-clamp-2">${item.title || 'Untitled'}</div>
                            </td>
                            <td class="px-4 py-3 text-sm">
                                <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">${item.category || 'General'}</span>
                            </td>
                            <td class="px-4 py-3 text-sm">
                                <div class="flex gap-1 flex-wrap">
                                    ${(item.tags || []).map(tag => `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">${tag}</span>`).join('') || '<span class="text-gray-400">No tags</span>'}
                                </div>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-500">${item.date || formatDate(item.createdAt)}</td>
                            <td class="px-4 py-3 text-center">
                                <button onclick="deleteSingleItem('${itemId}')" class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs font-semibold">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        `;
    } else {
        // Generic JSON view
        html += `<pre class="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-96">${JSON.stringify(paginatedData, null, 2)}</pre>`;
    }
    
    html += `</div>`;
    
    // Add Pagination Controls
    html += renderPaginationControls(currentPage, totalPages, actualDataLength);
    
    contentContainer.innerHTML = html;
    
    // Update stats
    const dataSize = (JSON.stringify(data).length / 1024).toFixed(2);
    statsContainer.innerHTML = `
        <span>Collection: <strong>${collectionName}</strong></span>
        <span class="ml-4">|</span>
        <span class="ml-4">Items: <strong>${actualDataLength}</strong></span>
        <span class="ml-4">|</span>
        <span class="ml-4">Page: <strong>${currentPage}/${totalPages}</strong></span>
        <span class="ml-4">|</span>
        <span class="ml-4">Size: <strong>${dataSize} KB</strong></span>
    `;
    
    console.log(`✅ RENDER COLLECTION DATA - COMPLETE`);
}

/**
 * Render pagination controls
 */
function renderPaginationControls(currentPage, totalPages, totalItems) {
    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = currentPage >= totalPages;
    
    console.log(`🔘 Pagination Controls: currentPage=${currentPage}, totalPages=${totalPages}, prevDisabled=${isPrevDisabled}, nextDisabled=${isNextDisabled}`);
    
    let html = `
        <div class="flex justify-between items-center mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <button 
                onclick="prevPage()" 
                class="pagination-btn px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                ${isPrevDisabled ? 'disabled' : ''}>
                ← Previous
            </button>
            
            <div class="flex items-center gap-4">
                <span class="text-sm font-semibold text-gray-700">
                    Page <span class="text-blue-600 text-lg">${currentPage}</span> of <span class="text-blue-600 text-lg">${totalPages}</span>
                </span>
                <span class="text-xs text-gray-500">
                    (${totalItems} total items)
                </span>
            </div>
            
            <button 
                onclick="nextPage()" 
                class="pagination-btn px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                ${isNextDisabled ? 'disabled' : ''}>
                Next →
            </button>
        </div>
    `;
    return html;
}

/**
 * Go to the previous page
 */
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderCollectionData(currentActiveTab);
    }
}

/**
 * Go to the next page
 */
function nextPage() {
    const data = currentViewData[currentActiveTab] || [];
    const totalPages = Math.ceil(data.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderCollectionData(currentActiveTab);
    }
}

/**
 * Change items per page
 */
function changeItemsPerPage() {
    const select = document.getElementById('itemsPerPageSelect');
    itemsPerPage = parseInt(select.value, 10);
    currentPage = 1; // Reset to first page
    renderCollectionData(currentActiveTab);
}

// ==================== DELETE OPERATIONS ====================

/**
 * Toggle selection of an item
 */
function toggleItemSelection(itemId) {
    if (selectedItems.has(itemId)) {
        selectedItems.delete(itemId);
    } else {
        selectedItems.add(itemId);
    }
    updateSelectedCount();
    
    // Update "Select All" checkbox state
    const totalCheckboxes = document.querySelectorAll('.item-checkbox').length;
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        selectAllCheckbox.checked = selectedItems.size === totalCheckboxes && totalCheckboxes > 0;
    }
}

/**
 * Toggle select all items on the current page
 */
function toggleSelectAllOnPage() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    
    if (selectAllCheckbox && selectAllCheckbox.checked) {
        // Select all on page
        checkboxes.forEach(cb => {
            cb.checked = true;
            const row = cb.closest('tr');
            if (row) {
                selectedItems.add(row.dataset.itemId);
            }
        });
    } else {
        // Deselect all on page
        checkboxes.forEach(cb => {
            cb.checked = false;
            const row = cb.closest('tr');
            if (row) {
                selectedItems.delete(row.dataset.itemId);
            }
        });
    }
    
    updateSelectedCount();
}

/**
 * Update selected count display
 */
function updateSelectedCount() {
    const countElement = document.getElementById('selectedCount');
    if (countElement) {
        countElement.textContent = selectedItems.size;
    }
    
    // Update "Select All" button text
    const selectAllText = document.getElementById('selectAllText');
    if (selectAllText) {
        const totalCheckboxes = document.querySelectorAll('.item-checkbox').length;
        if (selectedItems.size === totalCheckboxes && totalCheckboxes > 0) {
            selectAllText.textContent = '✗ Deselect All';
        } else {
            selectAllText.textContent = '✓ Select All';
        }
    }
}

/**
 * Delete selected items
 */
async function deleteSelected() {
    if (selectedItems.size === 0) {
        showToast('⚠️ No items selected', 'warning');
        return;
    }
    
    showConfirmModal(
        '⚠️ Confirm Bulk Delete',
        `Are you sure you want to delete ${selectedItems.size} selected item(s)?\n\nThis action cannot be undone!`,
        async () => {
            try {
                console.log('🔍 DELETE SELECTED - START');
                console.log('Selected items count:', selectedItems.size);
                console.log('Selected IDs:', Array.from(selectedItems));
                console.log('Current active tab:', currentActiveTab);
                console.log('Current collection type:', currentCollectionType);
                
                showToast(`⏳ Deleting ${selectedItems.size} items...`, 'info');
                
                // Get current data safely
                const data = currentViewData[currentActiveTab];
                if (!data || !Array.isArray(data)) {
                    throw new Error('No data available to delete');
                }
                
                console.log('📊 Before delete - Total items:', data.length);
                
                const idsToDelete = Array.from(selectedItems);
                
                // Pre-compute all item IDs using the SAME logic as rendering
                // This ensures consistent ID generation
                const itemIdMap = new Map();
                data.forEach((item, index) => {
                    const id = getItemId(item, index);
                    itemIdMap.set(item, id);
                    const isSelected = idsToDelete.includes(id);
                    if (isSelected) {
                        console.log(`✓ Item ${index}: ID = ${id} [WILL BE DELETED]`);
                    }
                });
                
                // Filter out deleted items using pre-computed IDs
                const remainingData = data.filter(item => {
                    const id = itemIdMap.get(item);
                    return !idsToDelete.includes(id);
                });
                
                console.log('📊 After filter - Remaining items:', remainingData.length);
                console.log('📊 Items removed:', data.length - remainingData.length);
                
                if (remainingData.length === data.length) {
                    throw new Error('No items were deleted! IDs may have changed. Try refreshing the page.');
                }
                
                // Save directly to the specific collection by name
                console.log('💾 Saving to MongoDB collection:', currentActiveTab);
                await saveToSpecificCollection(currentActiveTab, remainingData);
                console.log('✅ MongoDB save successful');
                
                // Update local data immediately
                currentViewData[currentActiveTab] = remainingData;
                console.log('✅ Local data updated - New count:', currentViewData[currentActiveTab].length);
                
                showToast(`✅ Successfully deleted ${data.length - remainingData.length} items!`, 'success');
                
                // Clear selections
                selectedItems.clear();
                
                // Re-render the current view WITHOUT re-fetching from server
                console.log('🔄 Re-rendering view with updated local data...');
                renderCollectionData(currentActiveTab);
                
                // Update backup status cards (this will fetch fresh counts)
                await loadBackupStatus();
                
                console.log('✅ DELETE SELECTED - COMPLETE');
                console.log('📊 Final count in view:', currentViewData[currentActiveTab].length);
                
            } catch (error) {
                console.error('❌ Error deleting items:', error);
                showToast(`❌ Error: ${error.message}`, 'error');
            }
        }
    );
}

/**
 * Delete a single item
 */
async function deleteSingleItem(itemId) {
    showConfirmModal(
        '⚠️ Confirm Delete',
        'Are you sure you want to delete this item?\n\nThis action cannot be undone!',
        async () => {
            try {
                console.log('🔍 DELETE SINGLE ITEM - START');
                console.log('Item ID:', itemId);
                
                showToast('⏳ Deleting item...', 'info');
                
                // Get current data safely
                const data = currentViewData[currentActiveTab];
                if (!data || !Array.isArray(data)) {
                    throw new Error('No data available to delete');
                }
                
                console.log('📊 Before delete - Total items:', data.length);
                
                // Pre-compute all item IDs using the SAME logic as rendering
                const itemIdMap = new Map();
                data.forEach((item, index) => {
                    const id = getItemId(item, index);
                    itemIdMap.set(item, id);
                });
                
                // Filter out the deleted item using pre-computed IDs
                const remainingData = data.filter(item => {
                    const id = itemIdMap.get(item);
                    return id !== itemId;
                });
                
                console.log('📊 After filter - Remaining items:', remainingData.length);
                
                if (remainingData.length === data.length) {
                    throw new Error('Item not found! ID may have changed. Try refreshing the page.');
                }
                
                // Save directly to the specific collection by name
                console.log('💾 Saving to MongoDB collection:', currentActiveTab);
                await saveToSpecificCollection(currentActiveTab, remainingData);
                console.log('✅ MongoDB save successful');
                
                // Update local data immediately
                currentViewData[currentActiveTab] = remainingData;
                console.log('✅ Local data updated - New count:', currentViewData[currentActiveTab].length);
                
                showToast('✅ Item deleted successfully!', 'success');
                
                // Re-render the current view WITHOUT re-fetching from server
                console.log('🔄 Re-rendering view with updated local data...');
                renderCollectionData(currentActiveTab);
                
                // Update backup status cards
                await loadBackupStatus();
                
                console.log('✅ DELETE SINGLE ITEM - COMPLETE');
                
            } catch (error) {
                console.error('❌ Error deleting item:', error);
                showToast(`❌ Error: ${error.message}`, 'error');
            }
        }
    );
}

/**
 * Toggle filter panel
 */
function toggleFilterPanel() {
    const panel = document.getElementById('filterPanel');
    if (panel) {
        panel.classList.toggle('hidden');
    }
}

/**
 * Apply filter to table
 */
function applyFilter() {
    const data = currentViewData[currentActiveTab] || [];
    const rows = document.querySelectorAll('tbody tr[data-item-id]');
    
    const videoIdFilter = document.getElementById('filterVideoId')?.value.toLowerCase() || '';
    const titleFilter = document.getElementById('filterTitle')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('filterCategory')?.value.toLowerCase() || '';
    const difficultyFilter = document.getElementById('filterDifficulty')?.value.toLowerCase() || '';
    
    let visibleCount = 0;
    
    rows.forEach((row, index) => {
        const item = data[index];
        if (!item) return;
        
        let matches = true;
        
        if (videoIdFilter && !(item.videoId || '').toLowerCase().includes(videoIdFilter)) {
            matches = false;
        }
        if (titleFilter && !(item.title || '').toLowerCase().includes(titleFilter)) {
            matches = false;
        }
        if (categoryFilter && !(item.category || '').toLowerCase().includes(categoryFilter)) {
            matches = false;
        }
        if (difficultyFilter && (item.difficulty || '').toLowerCase() !== difficultyFilter) {
            matches = false;
        }
        
        if (matches) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    showToast(`🔍 Filter applied: ${visibleCount} of ${data.length} items visible`, 'info');
}

/**
 * Clear all filters
 */
function clearFilter() {
    const filterInputs = document.querySelectorAll('#filterPanel input, #filterPanel select');
    filterInputs.forEach(input => input.value = '');
    
    const rows = document.querySelectorAll('tbody tr[data-item-id]');
    rows.forEach(row => row.style.display = '');
    
    showToast('✅ Filters cleared', 'success');
}

/**
 * Delete filtered (visible) items
 */
async function deleteFiltered() {
    const data = currentViewData[currentActiveTab] || [];
    const rows = document.querySelectorAll('tbody tr[data-item-id]');
    
    const visibleIds = [];
    rows.forEach((row, index) => {
        if (row.style.display !== 'none') {
            const itemId = row.dataset.itemId;
            visibleIds.push(itemId);
        }
    });
    
    if (visibleIds.length === 0) {
        showToast('⚠️ No visible items to delete', 'warning');
        return;
    }
    
    if (visibleIds.length === data.length) {
        showToast('⚠️ This will delete ALL items! Use "Clear Collection" instead.', 'warning');
        return;
    }
    
    showConfirmModal(
        '⚠️ Confirm Filtered Delete',
        `Are you sure you want to delete ${visibleIds.length} filtered item(s)?\n\nThis action cannot be undone!`,
        async () => {
            try {
                console.log('🔍 DELETE FILTERED - START');
                console.log('Filtered items count:', visibleIds.length);
                console.log('Filtered IDs:', visibleIds);
                console.log('Current active tab:', currentActiveTab);
                console.log('Current collection type:', currentCollectionType);
                
                showToast(`⏳ Deleting ${visibleIds.length} filtered items...`, 'info');
                
                console.log('📊 Before delete - Total items:', data.length);
                
                // Pre-compute all item IDs using the SAME logic as rendering
                const itemIdMap = new Map();
                data.forEach((item, index) => {
                    const id = getItemId(item, index);
                    itemIdMap.set(item, id);
                    const isVisible = visibleIds.includes(id);
                    if (isVisible) {
                        console.log(`✓ Item ${index}: ID = ${id} [WILL BE DELETED]`);
                    }
                });
                
                // Filter out deleted items using pre-computed IDs
                const remainingData = data.filter(item => {
                    const id = itemIdMap.get(item);
                    return !visibleIds.includes(id);
                });
                
                console.log('📊 After filter - Remaining items:', remainingData.length);
                console.log('📊 Items removed:', data.length - remainingData.length);
                
                if (remainingData.length === data.length) {
                    throw new Error('No items were deleted! IDs may have changed. Try refreshing the page.');
                }
                
                // Save directly to the specific collection by name
                console.log('💾 Saving to MongoDB collection:', currentActiveTab);
                await saveToSpecificCollection(currentActiveTab, remainingData);
                console.log('✅ MongoDB save successful');
                
                // Update local data immediately
                currentViewData[currentActiveTab] = remainingData;
                console.log('✅ Local data updated - New count:', currentViewData[currentActiveTab].length);
                
                showToast(`✅ Successfully deleted ${data.length - remainingData.length} filtered items!`, 'success');
                
                // Re-render the current view WITHOUT re-fetching from server
                console.log('🔄 Re-rendering view with updated local data...');
                renderCollectionData(currentActiveTab);
                
                // Update backup status cards
                await loadBackupStatus();
                
                console.log('✅ DELETE FILTERED - COMPLETE');
                console.log('📊 Final count in view:', currentViewData[currentActiveTab].length);
                
            } catch (error) {
                console.error('❌ Error deleting filtered items:', error);
                showToast(`❌ Error: ${error.message}`, 'error');
            }
        }
    );
}

/**
 * Helper function to strip HTML tags
 */
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

/**
 * Helper function to get difficulty color
 */
function getDifficultyColor(difficulty) {
    switch (difficulty?.toLowerCase()) {
        case 'easy':
            return 'bg-green-100 text-green-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'hard':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

/**
 * Helper function to format date
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/**
 * Close details modal
 */
function closeDetailsModal() {
    document.getElementById('detailsModal').classList.add('hidden');
    currentViewData = {};
    currentActiveTab = null;
}

/**
 * Download current view data as JSON
 */
function downloadCurrentDetails() {
    if (!currentActiveTab || !currentViewData[currentActiveTab]) {
        showToast('⚠️ No data to download', 'warning');
        return;
    }
    
    const data = currentViewData[currentActiveTab];
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentActiveTab}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast(`✅ Downloaded ${data.length} items!`, 'success');
}
