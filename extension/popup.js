document.addEventListener('DOMContentLoaded', async function() {
    // Initialize popup
    await loadUserData();
    await loadSettings();
    setupEventListeners();
});

// Tab functionality
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // Profile form
    document.getElementById('profile-form').addEventListener('submit', saveProfile);
    document.getElementById('settings-form').addEventListener('submit', saveSettings);
    document.getElementById('resume-file').addEventListener('change', handleResumeUpload);

    // Action buttons
    document.getElementById('parse-job-description').addEventListener('click', parseJobDescription);
    document.getElementById('optimize-resume').addEventListener('click', optimizeResume);
    document.getElementById('generate-cover-letter').addEventListener('click', generateCoverLetter);
    document.getElementById('fill-application').addEventListener('click', fillApplication);
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

async function loadUserData() {
    try {
        const data = await chrome.storage.sync.get(['userProfile']);
        if (data.userProfile) {
            const profile = data.userProfile;
            document.getElementById('full-name').value = profile.fullName || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('phone').value = profile.phone || '';
            document.getElementById('linkedin').value = profile.linkedin || '';
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function loadSettings() {
    try {
        const data = await chrome.storage.sync.get(['extensionSettings']);
        if (data.extensionSettings) {
            const settings = data.extensionSettings;
            document.getElementById('backend-url').value = settings.backendUrl || 'http://localhost:3000';
            document.getElementById('auto-fill').checked = settings.autoFill || false;
            document.getElementById('smart-suggestions').checked = settings.smartSuggestions || false;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveProfile(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const profile = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        linkedin: formData.get('linkedin')
    };

    try {
        await chrome.storage.sync.set({ userProfile: profile });
        showStatus('Profile saved successfully!', 'success');
    } catch (error) {
        showStatus('Error saving profile: ' + error.message, 'error');
    }
}

async function saveSettings(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const settings = {
        backendUrl: formData.get('backendUrl'),
        autoFill: formData.has('autoFill'),
        smartSuggestions: formData.has('smartSuggestions')
    };

    try {
        await chrome.storage.sync.set({ extensionSettings: settings });
        showStatus('Settings saved successfully!', 'success');
    } catch (error) {
        showStatus('Error saving settings: ' + error.message, 'error');
    }
}

async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusDiv = document.getElementById('resume-status');
    statusDiv.textContent = 'Uploading resume...';

    try {
        // TODO: Implement resume upload to backend
        const formData = new FormData();
        formData.append('resume', file);

        const settings = await chrome.storage.sync.get(['extensionSettings']);
        const backendUrl = settings.extensionSettings?.backendUrl || 'http://localhost:3000';

        const response = await fetch(`${backendUrl}/api/resume/upload`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            statusDiv.textContent = 'Resume uploaded successfully!';
            statusDiv.className = 'success';
            
            // Save resume info to storage
            await chrome.storage.sync.set({ 
                resumeInfo: { 
                    filename: result.filename,
                    uploadDate: new Date().toISOString()
                }
            });
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        statusDiv.textContent = 'Upload failed: ' + error.message;
        statusDiv.className = 'error';
    }
}

async function parseJobDescription() {
    try {
        showStatus('Parsing job description...', 'info');
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        const result = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                // This will be executed in the content script context
                if (window.parseJobDescription) {
                    return window.parseJobDescription();
                }
                return null;
            }
        });

        if (result[0].result) {
            showStatus('Job description parsed successfully!', 'success');
        } else {
            showStatus('No job description found on this page', 'warning');
        }
    } catch (error) {
        showStatus('Error parsing job description: ' + error.message, 'error');
    }
}

async function optimizeResume() {
    try {
        showStatus('Optimizing resume...', 'info');
        
        // TODO: Implement resume optimization
        // This would send the job description and resume to the backend
        
        setTimeout(() => {
            showStatus('Resume optimization completed!', 'success');
        }, 2000);
    } catch (error) {
        showStatus('Error optimizing resume: ' + error.message, 'error');
    }
}

async function generateCoverLetter() {
    try {
        showStatus('Generating cover letter...', 'info');
        
        // TODO: Implement cover letter generation
        // This would send job info and resume to backend
        
        setTimeout(() => {
            showStatus('Cover letter generated!', 'success');
        }, 3000);
    } catch (error) {
        showStatus('Error generating cover letter: ' + error.message, 'error');
    }
}

async function fillApplication() {
    try {
        showStatus('Auto-filling application...', 'info');
        
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => {
                if (window.autoFillApplication) {
                    window.autoFillApplication();
                }
            }
        });

        showStatus('Application auto-filled!', 'success');
    } catch (error) {
        showStatus('Error auto-filling application: ' + error.message, 'error');
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    // Clear status after 3 seconds
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
    }, 3000);
}
