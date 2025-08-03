// Background script for HireAssist extension

// Service Worker for Manifest V3
chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === 'install') {
        console.log('HireAssist extension installed');
        
        // Initialize default settings
        await initializeDefaultSettings();
        
        // Show welcome notification
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'public/icon48.png',
            title: 'HireAssist Installed!',
            message: 'Click the extension icon to set up your profile and start using AI-powered job assistance.'
        });
    } else if (details.reason === 'update') {
        console.log('HireAssist extension updated');
        
        // Handle any data migration if needed
        await handleUpdate(details.previousVersion);
    }
});

// Initialize default settings
async function initializeDefaultSettings() {
    try {
        const defaultSettings = {
            backendUrl: 'http://localhost:3000',
            autoFill: false,
            smartSuggestions: true,
            notificationsEnabled: true
        };
        
        // Only set if not already configured
        const existing = await chrome.storage.sync.get(['extensionSettings']);
        if (!existing.extensionSettings) {
            await chrome.storage.sync.set({ extensionSettings: defaultSettings });
            console.log('Default settings initialized');
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
}

// Handle extension updates
async function handleUpdate(previousVersion) {
    try {
        // Perform any necessary data migration
        console.log(`Updated from version ${previousVersion}`);
        
        // Example: Migration logic for different versions
        if (previousVersion && compareVersions(previousVersion, '1.0.0') < 0) {
            // Migrate data from pre-1.0.0 versions
            await migrateToV1();
        }
    } catch (error) {
        console.error('Error handling update:', error);
    }
}

// Message handling for communication with content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background received message:', message);
    
    switch (message.type) {
        case 'GET_JOB_DATA':
            handleGetJobData(sendResponse);
            return true; // Keep channel open for async response
            
        case 'SAVE_JOB_DATA':
            handleSaveJobData(message.data, sendResponse);
            return true;
            
        case 'GENERATE_ANSWER':
            handleGenerateAnswer(message.data, sendResponse);
            return true;
            
        case 'CHECK_BACKEND_STATUS':
            handleBackendStatusCheck(sendResponse);
            return true;
            
        default:
            console.log('Unknown message type:', message.type);
            sendResponse({ error: 'Unknown message type' });
    }
});

// Handle job data retrieval
async function handleGetJobData(sendResponse) {
    try {
        const data = await chrome.storage.local.get(['currentJobData']);
        sendResponse({ success: true, data: data.currentJobData });
    } catch (error) {
        console.error('Error getting job data:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle job data saving
async function handleSaveJobData(jobData, sendResponse) {
    try {
        await chrome.storage.local.set({ 
            currentJobData: jobData,
            lastJobUpdate: new Date().toISOString()
        });
        
        // Also save to job history
        const history = await chrome.storage.local.get(['jobHistory']);
        const jobHistory = history.jobHistory || [];
        jobHistory.unshift(jobData);
        
        // Keep only last 50 jobs
        if (jobHistory.length > 50) {
            jobHistory.splice(50);
        }
        
        await chrome.storage.local.set({ jobHistory });
        
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error saving job data:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle answer generation requests
async function handleGenerateAnswer(requestData, sendResponse) {
    try {
        // Get user settings
        const settings = await chrome.storage.sync.get(['extensionSettings']);
        const backendUrl = settings.extensionSettings?.backendUrl || 'http://localhost:3000';
        
        // Make API request to backend
        const response = await fetch(`${backendUrl}/api/answer/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (response.ok) {
            const result = await response.json();
            sendResponse({ success: true, data: result });
        } else {
            throw new Error(`API request failed: ${response.status}`);
        }
    } catch (error) {
        console.error('Error generating answer:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Check backend server status
async function handleBackendStatusCheck(sendResponse) {
    try {
        const settings = await chrome.storage.sync.get(['extensionSettings']);
        const backendUrl = settings.extensionSettings?.backendUrl || 'http://localhost:3000';
        
        const response = await fetch(`${backendUrl}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const result = await response.json();
            sendResponse({ success: true, status: 'online', data: result });
        } else {
            throw new Error(`Backend returned: ${response.status}`);
        }
    } catch (error) {
        console.error('Backend status check failed:', error);
        sendResponse({ 
            success: false, 
            status: 'offline', 
            error: error.message 
        });
    }
}

// Periodic backend health check
async function performPeriodicHealthCheck() {
    try {
        const settings = await chrome.storage.sync.get(['extensionSettings']);
        if (!settings.extensionSettings?.notificationsEnabled) {
            return;
        }
        
        const backendUrl = settings.extensionSettings.backendUrl || 'http://localhost:3000';
        
        const response = await fetch(`${backendUrl}/health`);
        
        if (!response.ok) {
            // Show notification if backend is down
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'public/icon48.png',
                title: 'HireAssist Backend Offline',
                message: 'The HireAssist backend server is not responding. Some features may not work.'
            });
        }
    } catch (error) {
        // Backend is likely offline, but don't spam notifications
        console.log('Backend health check failed (expected if server is off)');
    }
}

// Set up periodic health check (every 5 minutes)
chrome.alarms.create('healthCheck', { periodInMinutes: 5 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'healthCheck') {
        performPeriodicHealthCheck();
    }
});

// Handle tab updates to detect job sites
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        const jobSites = [
            'linkedin.com/jobs',
            'indeed.com',
            'glassdoor.com',
            'workday.com',
            'greenhouse.io',
            'lever.co'
        ];
        
        const isJobSite = jobSites.some(site => tab.url.includes(site));
        
        if (isJobSite) {
            // Update extension badge to indicate we're on a job site
            chrome.action.setBadgeText({
                tabId: tabId,
                text: 'JOB'
            });
            
            chrome.action.setBadgeBackgroundColor({
                tabId: tabId,
                color: '#4285f4'
            });
        } else {
            // Clear badge on non-job sites
            chrome.action.setBadgeText({
                tabId: tabId,
                text: ''
            });
        }
    }
});

// Utility functions
function compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
        const v1part = v1parts[i] || 0;
        const v2part = v2parts[i] || 0;
        
        if (v1part < v2part) return -1;
        if (v1part > v2part) return 1;
    }
    
    return 0;
}

async function migrateToV1() {
    // Example migration logic
    console.log('Performing migration to version 1.0.0');
    
    try {
        // Migrate old storage format if needed
        const oldData = await chrome.storage.local.get(['oldFormatData']);
        if (oldData.oldFormatData) {
            // Convert to new format
            const newData = convertToNewFormat(oldData.oldFormatData);
            await chrome.storage.local.set({ currentJobData: newData });
            await chrome.storage.local.remove(['oldFormatData']);
        }
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

function convertToNewFormat(oldData) {
    // Convert old data format to new format
    return {
        ...oldData,
        version: '1.0.0',
        migrationDate: new Date().toISOString()
    };
}

console.log('HireAssist background script loaded');
