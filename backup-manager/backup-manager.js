// ==================== CENTRALIZED BACKUP MANAGER ====================
// Handles backup operations for both Study Notes and YouTube Roadmap
// UPDATED: Works with modern individual document API endpoints

let currentModule = null;
let currentEndpoint = null;
let confirmCallback = null;

// Module Configuration - UPDATED to use new endpoints
const MODULE_CONFIG = {
    studyNotes: {
        name: 'Study Notes',
        endpoint: '/api/notes',
        icon: '📝',
        itemLabel: 'Notes',
        backupCollections: {
            active: 'notes_backup_active',
            temp: 'notes_backup_temp',
            final: 'notes_backup_final'
        }
    },
    youtubeRoadmap: {
        name: 'YouTube Roadmap',
        endpoint: '/api/videos',
        icon: '🎬',
        itemLabel: 'Videos',
        backupCollections: {
            active: 'videos_backup_active',
            temp: 'videos_backup_temp',
            final: 'videos_backup_final'
        }
    }
};

// IndexedDB Configuration for backups
const BACKUP_DB_NAME = 'CodingTerminalsBackupDB';
const BACKUP_DB_VERSION = 1;
let backupDB = null;

// ==================== INDEXEDDB INITIALIZATION ====================

/**
 * Initialize IndexedDB for backup storage
 */
function initializeBackupDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(BACKUP_DB_NAME, BACKUP_DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            backupDB = request.result;
            resolve(backupDB);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores for each backup collection
            const collections = [
                'notes_backup_active', 'notes_backup_temp', 'notes_backup_final',
                'videos_backup_active', 'videos_backup_temp', 'videos_backup_final'
            ];
            
            collections.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: '_id' });
                }
            });
        };
    });
}

// ==================== MODULE SELECTION ====================

/**
 * Select which module to manage (Study Notes or YouTube Roadmap)
 */
async function selectModule(moduleName) {
    currentModule = moduleName;
    const config = MODULE_CONFIG[moduleName];
    currentEndpoint = config.endpoint;
    
    // Initialize backup DB if not already done
    if (!backupDB) {
        await initializeBackupDB();
    }
    
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
 * Load backup status for all collections
 */
async function loadBackupStatus() {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    try {
        showToast('🔄 Loading backup status...', 'info');
        
        const config = MODULE_CONFIG[currentModule];
        
        // Get counts from IndexedDB backup stores
        const activeData = await getBackupData('active');
        const tempData = await getBackupData('temp');
        const finalData = await getBackupData('final');
        
        // Update Active Collection Status (from live MongoDB)
        const liveData = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}`);
        const liveItems = liveData.ok ? await liveData.json() : [];
        
        updateStatusCard('activeStatus', {
            exists: liveItems.length > 0,
            count: liveItems.length,
            lastUpdated: liveItems[0]?.updatedAt || new Date().toISOString()
        }, config.itemLabel);
        
        // Update Temp Collection Status
        updateStatusCard('tempStatus', {
            exists: tempData.length > 0,
            count: tempData.length,
            lastUpdated: tempData[0]?.backedUpAt || null
        }, config.itemLabel);
        
        // Update Final Collection Status
        updateStatusCard('finalStatus', {
            exists: finalData.length > 0,
            count: finalData.length,
            lastUpdated: finalData[0]?.backedUpAt || null
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

// ==================== INDEXEDDB BACKUP OPERATIONS ====================

/**
 * Get backup data from IndexedDB
 */
async function getBackupData(collectionType) {
    if (!backupDB) await initializeBackupDB();
    
    const config = MODULE_CONFIG[currentModule];
    const storeName = config.backupCollections[collectionType];
    
    return new Promise((resolve, reject) => {
        const transaction = backupDB.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
    });
}

/**
 * Save backup data to IndexedDB
 */
async function saveBackupData(collectionType, data) {
    if (!backupDB) await initializeBackupDB();
    
    const config = MODULE_CONFIG[currentModule];
    const storeName = config.backupCollections[collectionType];
    
    return new Promise((resolve, reject) => {
        const transaction = backupDB.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        // Clear existing data
        store.clear();
        
        // Add new data with backup timestamp
        data.forEach(item => {
            store.add({
                ...item,
                backedUpAt: new Date().toISOString()
            });
        });
        
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
    });
}

/**
 * Clear backup data from IndexedDB
 */
async function clearBackupData(collectionType) {
    if (!backupDB) await initializeBackupDB();
    
    const config = MODULE_CONFIG[currentModule];
    const storeName = config.backupCollections[collectionType];
    
    return new Promise((resolve, reject) => {
        const transaction = backupDB.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ==================== DATA MIGRATION ====================

/**
 * Copy data between collections
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
                
                let sourceData;
                
                // Get source data
                if (from === 'active') {
                    // Fetch from live MongoDB
                    const response = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}`);
                    if (!response.ok) throw new Error('Failed to fetch live data');
                    sourceData = await response.json();
                } else {
                    // Get from IndexedDB backup
                    sourceData = await getBackupData(from);
                }
                
                if (!sourceData || sourceData.length === 0) {
                    throw new Error(`No data found in ${collectionNames[from]}`);
                }
                
                // Save to destination
                if (to === 'active') {
                    // Restore to live MongoDB using bulk upsert
                    const response = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}/bulk`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(sourceData)
                    });
                    
                    if (!response.ok) throw new Error('Failed to restore to MongoDB');
                    const result = await response.json();
                    showToast(`✅ Successfully restored ${result.upsertedCount || sourceData.length} items to ${collectionNames[to]}!`, 'success');
                } else {
                    // Save to IndexedDB backup
                    await saveBackupData(to, sourceData);
                    showToast(`✅ Successfully copied ${sourceData.length} items from ${collectionNames[from]} to ${collectionNames[to]}!`, 'success');
                }
                
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
        
        let data;
        if (collectionType === 'active') {
            // Export from live MongoDB
            const response = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}`);
            if (!response.ok) throw new Error('Failed to fetch data');
            data = await response.json();
        } else {
            // Export from IndexedDB backup
            data = await getBackupData(collectionType);
        }
        
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
 * Clear a collection
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
                
                if (collectionType === 'active') {
                    // Clear live MongoDB - delete all documents
                    const fetchResponse = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}`);
                    const items = await fetchResponse.json();
                    
                    // Delete each document
                    for (const item of items) {
                        await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}/${item._id}`, {
                            method: 'DELETE'
                        });
                    }
                    showToast(`✅ ${collectionNames[collectionType]} cleared! (${items.length} items deleted)`, 'success');
                } else {
                    // Clear IndexedDB backup
                    await clearBackupData(collectionType);
                    showToast(`✅ ${collectionNames[collectionType]} cleared!`, 'success');
                }
                
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
    await initializeBackupDB();
    showToast('👋 Welcome! Please select a module to begin', 'info');
});
