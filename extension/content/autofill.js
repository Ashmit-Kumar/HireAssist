// Auto-fill functionality for job application forms

class AutoFiller {
    constructor() {
        this.userProfile = null;
        this.resumeData = null;
        this.init();
    }

    async init() {
        try {
            const data = await chrome.storage.sync.get(['userProfile', 'resumeData']);
            this.userProfile = data.userProfile;
            this.resumeData = data.resumeData;
            
            this.setupAutoFill();
        } catch (error) {
            console.error('AutoFiller initialization error:', error);
        }
    }

    setupAutoFill() {
        // Add auto-fill button to detected forms
        this.detectForms();
        
        // Listen for form changes
        const observer = new MutationObserver(() => {
            this.detectForms();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    detectForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            if (this.isJobApplicationForm(form) && !form.hasAttribute('data-hireassist-processed')) {
                this.addAutoFillButton(form);
                form.setAttribute('data-hireassist-processed', 'true');
            }
        });
    }

    isJobApplicationForm(form) {
        const formText = form.textContent.toLowerCase();
        const applicationKeywords = [
            'first name', 'last name', 'email', 'phone', 'resume',
            'cover letter', 'application', 'apply', 'candidate',
            'linkedin', 'portfolio', 'experience', 'education'
        ];
        
        return applicationKeywords.some(keyword => formText.includes(keyword));
    }

    addAutoFillButton(form) {
        const button = document.createElement('button');
        button.textContent = '🤖 Auto-fill with HireAssist';
        button.type = 'button';
        button.className = 'hireassist-autofill-btn';
        button.style.cssText = `
            background: #4285f4;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            margin: 8px 0;
            cursor: pointer;
            font-size: 14px;
            z-index: 10000;
            position: relative;
        `;
        
        button.addEventListener('click', () => this.fillForm(form));
        
        // Insert button at the top of the form
        form.insertBefore(button, form.firstChild);
    }

    async fillForm(form) {
        if (!this.userProfile) {
            alert('Please set up your profile in the HireAssist extension first.');
            return;
        }

        try {
            const fields = this.detectFields(form);
            
            for (const [fieldType, elements] of Object.entries(fields)) {
                if (elements.length > 0) {
                    this.fillFieldType(fieldType, elements);
                }
            }
            
            // Show success message
            this.showNotification('Form auto-filled successfully!', 'success');
        } catch (error) {
            console.error('Auto-fill error:', error);
            this.showNotification('Error auto-filling form: ' + error.message, 'error');
        }
    }

    detectFields(form) {
        const fields = {
            firstName: [],
            lastName: [],
            fullName: [],
            email: [],
            phone: [],
            linkedin: [],
            portfolio: [],
            coverLetter: [],
            resume: []
        };

        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            const fieldType = this.identifyFieldType(input);
            if (fieldType && fields[fieldType]) {
                fields[fieldType].push(input);
            }
        });

        return fields;
    }

    identifyFieldType(element) {
        const text = (
            element.name + ' ' +
            element.id + ' ' +
            element.placeholder + ' ' +
            (element.labels?.[0]?.textContent || '') + ' ' +
            (element.previousElementSibling?.textContent || '') + ' ' +
            (element.parentElement?.textContent || '')
        ).toLowerCase();

        if (text.includes('first') && text.includes('name')) return 'firstName';
        if (text.includes('last') && text.includes('name')) return 'lastName';
        if (text.includes('full') && text.includes('name')) return 'fullName';
        if (text.includes('email')) return 'email';
        if (text.includes('phone') || text.includes('mobile')) return 'phone';
        if (text.includes('linkedin')) return 'linkedin';
        if (text.includes('portfolio') || text.includes('website')) return 'portfolio';
        if (text.includes('cover') && text.includes('letter')) return 'coverLetter';
        if (text.includes('resume') || text.includes('cv')) return 'resume';

        return null;
    }

    fillFieldType(fieldType, elements) {
        const value = this.getValueForFieldType(fieldType);
        
        elements.forEach(element => {
            if (element.type === 'file') {
                // Handle file uploads differently
                this.handleFileUpload(element, fieldType);
            } else {
                element.value = value;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }

    getValueForFieldType(fieldType) {
        if (!this.userProfile) return '';

        switch (fieldType) {
            case 'firstName':
                return this.userProfile.fullName?.split(' ')[0] || '';
            case 'lastName':
                return this.userProfile.fullName?.split(' ').slice(1).join(' ') || '';
            case 'fullName':
                return this.userProfile.fullName || '';
            case 'email':
                return this.userProfile.email || '';
            case 'phone':
                return this.userProfile.phone || '';
            case 'linkedin':
                return this.userProfile.linkedin || '';
            case 'portfolio':
                return this.userProfile.portfolio || '';
            case 'coverLetter':
                return this.resumeData?.coverLetter || '';
            default:
                return '';
        }
    }

    handleFileUpload(element, fieldType) {
        // Create a visual indicator that file upload is needed
        const indicator = document.createElement('span');
        indicator.textContent = ' (Upload your ' + fieldType + ')';
        indicator.style.color = '#ff6b6b';
        indicator.style.fontSize = '12px';
        
        if (!element.nextElementSibling?.textContent?.includes('Upload your')) {
            element.parentNode.insertBefore(indicator, element.nextSibling);
        }
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            background: ${type === 'success' ? '#4caf50' : '#f44336'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for popup integration
window.autoFillApplication = function() {
    const autoFiller = new AutoFiller();
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
        autoFiller.fillForm(forms[0]);
    } else {
        autoFiller.showNotification('No application form found on this page', 'error');
    }
};

// Initialize auto-filler
const autoFiller = new AutoFiller();
