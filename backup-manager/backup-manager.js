// ==================== CENTRALIZED BACKUP MANAGER ====================
// Handles backup operations for both Study Notes and YouTube Roadmap
// Purpose: Move data between MongoDB collections (Active, Temp, Final)
// This is an ADMIN tool - no need for IndexedDB caching

let currentModule = null;
let currentEndpoint = null;
let confirmCallback = null;

// Module Configuration
const MODULE_CONFIG = {
    studyNotes: {
        name: 'Study Notes',
        endpoint: '/api/studynotes',
        icon: '📝',
        itemLabel: 'Notes'
    },
    youtubeRoadmap: {
        name: 'YouTube Roadmap',
        endpoint: '/api/videos',
        icon: '🎬',
        itemLabel: 'Videos'
    }
};

// ==================== MODULE SELECTION ====================

/**
 * Select which module to manage (Study Notes or YouTube Roadmap)
 */
function selectModule(moduleName) {
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
    loadBackupStatus();
    
    showToast(`✅ Switched to ${config.name}`, 'success');
}

// ==================== BACKUP STATUS ====================

/**
 * Load backup status for all collections
 * Direct API call - no caching needed for admin tool
 */
async function loadBackupStatus() {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    try {
        showToast('🔄 Loading backup status...', 'info');
        
        const response = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}/backup/status`);
        
        if (!response.ok) {
            throw new Error('Failed to load backup status');
        }
        
        const data = await response.json();
        const config = MODULE_CONFIG[currentModule];
        
        // Update Active Collection Status
        updateStatusCard('activeStatus', data.status.active, config.itemLabel);
        
        // Update Temp Collection Status
        updateStatusCard('tempStatus', data.status.temp, config.itemLabel);
        
        // Update Final Collection Status
        updateStatusCard('finalStatus', data.status.final, config.itemLabel);
        
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
        const itemCount = statusData.noteCount || statusData.videoCount || 0;
        element.innerHTML = `
            <div class="flex justify-between">
                <span class="text-blue-100">${itemLabel}:</span>
                <span class="font-semibold">${itemCount}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-blue-100">Last Updated:</span>
                <span class="font-semibold text-xs">${statusData.lastUpdated ? new Date(statusData.lastUpdated).toLocaleString() : 'N/A'}</span>
            </div>
        `;
    } else {
        element.innerHTML = `<div class="text-yellow-200 text-sm">No data</div>`;
    }
}

// ==================== DATA MIGRATION ====================

/**
 * Copy data between collections
 * Direct MongoDB operations - no IndexedDB needed
 */
async function copyData(from, to) {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    const collectionNames = {
        'active': 'Active',
        'temp': 'Temp',
        'final': 'Final'
    };
    
    const config = MODULE_CONFIG[currentModule];
    const message = `Are you sure you want to copy ${config.name} data from ${collectionNames[from]} to ${collectionNames[to]}?\n\nThis will overwrite any existing data in ${collectionNames[to]}.`;
    
    showConfirmModal(
        `🔄 Copy ${collectionNames[from]} → ${collectionNames[to]}`,
        message,
        async () => {
            try {
                showToast(`⏳ Copying data from ${collectionNames[from]} to ${collectionNames[to]}...`, 'info');
                
                const response = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}/backup/copy`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ from, to })
                });
                
                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to copy data');
                }
                
                const itemCount = data.noteCount || data.videoCount || 0;
                showToast(`✅ Successfully copied ${itemCount} items from ${collectionNames[from]} to ${collectionNames[to]}!`, 'success');
                
                // Reload backup status to show updated counts
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
 * Export collection data with Base64 images
 */
async function exportCollection(collectionType) {
    if (!currentModule) {
        showToast('⚠️ Please select a module first', 'warning');
        return;
    }
    
    try {
        const config = MODULE_CONFIG[currentModule];
        showToast(`📥 Exporting ${collectionType} collection...`, 'info');
        
        const response = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}/export?collectionType=${collectionType}`);
        
        if (!response.ok) {
            throw new Error('Failed to export data');
        }
        
        const data = await response.json();
        
        // Download as JSON file
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentModule}_${collectionType}_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        const itemCount = (data.notes?.length || data.videos?.length || 0);
        showToast(`✅ ${collectionType} collection exported with images! (${itemCount} items)`, 'success');
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
        'active': 'Active',
        'temp': 'Temp',
        'final': 'Final'
    };
    
    const config = MODULE_CONFIG[currentModule];
    const warningLevel = collectionType === 'active' ? '⚠️ DANGER' : '⚠️ Warning';
    const message = collectionType === 'active' 
        ? `🚨 THIS WILL DELETE ALL YOUR CURRENT ${config.name.toUpperCase()} DATA! 🚨\n\nAre you absolutely sure you want to clear the Active collection?\n\nThis action cannot be undone!\n\nConsider backing up to Temp or Final first.`
        : `Are you sure you want to clear the ${collectionNames[collectionType]} collection for ${config.name}?\n\nThis action cannot be undone.`;
    
    showConfirmModal(
        `${warningLevel}: Clear ${collectionNames[collectionType]} Collection`,
        message,
        async () => {
            try {
                showToast(`⏳ Clearing ${collectionNames[collectionType]} collection...`, 'info');
                
                const requestBody = collectionType === 'active' ? { confirmed: true } : {};
                
                const response = await fetch(`${APP_CONFIG.API.BASE_URL}${currentEndpoint}/collection/${collectionType}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                
                const data = await response.json();
                
                if (!response.ok || !data.success) {
                    throw new Error(data.error || 'Failed to clear collection');
                }
                
                showToast(`✅ ${collectionNames[collectionType]} collection cleared!`, 'success');
                
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

// Show instruction on page load
window.addEventListener('load', () => {
    showToast('👋 Welcome! Please select a module to begin', 'info');
});
