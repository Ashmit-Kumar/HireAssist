// Question detector for identifying and helping with application questions

class QuestionDetector {
    constructor() {
        this.detectedQuestions = [];
        this.init();
    }

    init() {
        this.setupDetection();
        this.setupContextMenu();
    }

    setupDetection() {
        // Detect questions when page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.detectQuestions());
        } else {
            this.detectQuestions();
        }

        // Monitor for dynamically added questions
        const observer = new MutationObserver(() => {
            this.detectQuestions();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupContextMenu() {
        // Add context menu for selected text
        document.addEventListener('mouseup', (event) => {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText.length > 10 && this.isQuestion(selectedText)) {
                this.showQuestionHelper(event, selectedText);
            }
        });
    }

    detectQuestions() {
        const questionElements = this.findQuestionElements();
        
        questionElements.forEach(element => {
            if (!element.hasAttribute('data-hireassist-processed')) {
                this.processQuestion(element);
                element.setAttribute('data-hireassist-processed', 'true');
            }
        });
    }

    findQuestionElements() {
        const questionSelectors = [
            'textarea',
            'input[type="text"]',
            '[contenteditable="true"]',
            'label',
            '.question',
            '[class*="question"]',
            '[id*="question"]'
        ];

        const elements = [];
        
        questionSelectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(element => {
                const text = this.getElementText(element);
                if (this.isQuestion(text) || this.hasQuestionContext(element)) {
                    elements.push(element);
                }
            });
        });

        return elements;
    }

    getElementText(element) {
        return (
            element.textContent + ' ' +
            element.placeholder + ' ' +
            (element.labels?.[0]?.textContent || '') + ' ' +
            (element.previousElementSibling?.textContent || '') + ' ' +
            (element.parentElement?.textContent || '')
        ).trim();
    }

    isQuestion(text) {
        if (!text || text.length < 10) return false;
        
        const questionPatterns = [
            /\?/,
            /^(why|what|how|when|where|who|which|describe|explain|tell)/i,
            /(experience|example|situation|challenge|accomplishment|goal)/i,
            /(strengths|weaknesses|skills|qualification)/i,
            /(motivation|interested|passion|career)/i
        ];

        return questionPatterns.some(pattern => pattern.test(text));
    }

    hasQuestionContext(element) {
        const contextText = this.getElementText(element);
        const questionKeywords = [
            'cover letter', 'personal statement', 'motivation',
            'additional information', 'comments', 'message',
            'why are you', 'tell us about', 'describe your'
        ];

        return questionKeywords.some(keyword => 
            contextText.toLowerCase().includes(keyword)
        );
    }

    processQuestion(element) {
        const questionText = this.getElementText(element);
        const questionData = {
            element: element,
            text: questionText,
            type: this.categorizeQuestion(questionText),
            context: this.getQuestionContext(element)
        };

        this.detectedQuestions.push(questionData);
        this.addQuestionHelper(element, questionData);
    }

    categorizeQuestion(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('cover letter')) return 'cover-letter';
        if (lowerText.includes('why') && (lowerText.includes('company') || lowerText.includes('role'))) return 'motivation';
        if (lowerText.includes('experience') || lowerText.includes('example')) return 'experience';
        if (lowerText.includes('strength') || lowerText.includes('skill')) return 'strengths';
        if (lowerText.includes('weakness') || lowerText.includes('challenge')) return 'challenges';
        if (lowerText.includes('goal') || lowerText.includes('future')) return 'goals';
        if (lowerText.includes('achievement') || lowerText.includes('accomplishment')) return 'achievements';
        
        return 'general';
    }

    getQuestionContext(element) {
        // Get surrounding context for better understanding
        const parent = element.closest('form, section, div[class*="question"], div[class*="field"]');
        if (parent) {
            return parent.textContent.substring(0, 500);
        }
        return '';
    }

    addQuestionHelper(element, questionData) {
        if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            this.addAnswerButton(element, questionData);
        }
    }

    addAnswerButton(element, questionData) {
        const button = document.createElement('button');
        button.textContent = '🤖 Get AI Answer';
        button.type = 'button';
        button.className = 'hireassist-answer-btn';
        button.style.cssText = `
            background: #34a853;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
            cursor: pointer;
            margin-left: 8px;
            z-index: 10000;
            position: relative;
        `;
        
        button.addEventListener('click', () => this.generateAnswer(element, questionData));
        
        // Insert button next to the input field
        element.parentNode.insertBefore(button, element.nextSibling);
    }

    showQuestionHelper(event, selectedText) {
        // Remove existing helper
        const existing = document.getElementById('hireassist-question-helper');
        if (existing) existing.remove();

        const helper = document.createElement('div');
        helper.id = 'hireassist-question-helper';
        helper.innerHTML = `
            <div style="
                position: fixed;
                top: ${event.pageY + 10}px;
                left: ${event.pageX + 10}px;
                background: #2196f3;
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            ">
                🤖 Get AI Answer for this Question
            </div>
        `;
        
        helper.addEventListener('click', () => {
            this.generateAnswerForText(selectedText);
            helper.remove();
        });
        
        document.body.appendChild(helper);
        
        // Remove helper after 3 seconds
        setTimeout(() => helper.remove(), 3000);
    }

    async generateAnswer(element, questionData) {
        try {
            element.placeholder = 'Generating AI answer...';
            element.disabled = true;

            // Get user profile and job data
            const [userProfile, jobData] = await Promise.all([
                chrome.storage.sync.get(['userProfile']),
                chrome.storage.local.get(['currentJobData'])
            ]);

            // Call backend API to generate answer
            const settings = await chrome.storage.sync.get(['extensionSettings']);
            const backendUrl = settings.extensionSettings?.backendUrl || 'http://localhost:3000';

            const response = await fetch(`${backendUrl}/api/answer/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: questionData.text,
                    context: questionData.context,
                    userProfile: userProfile.userProfile,
                    jobData: jobData.currentJobData
                })
            });

            if (response.ok) {
                const result = await response.json();
                element.value = result.answer;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                this.showNotification('AI answer generated!', 'success');
            } else {
                throw new Error('Failed to generate answer');
            }
        } catch (error) {
            console.error('Error generating answer:', error);
            this.showNotification('Error generating answer: ' + error.message, 'error');
        } finally {
            element.disabled = false;
            element.placeholder = '';
        }
    }

    async generateAnswerForText(questionText) {
        try {
            this.showNotification('Generating AI answer...', 'info');

            // Get user profile and job data
            const [userProfile, jobData] = await Promise.all([
                chrome.storage.sync.get(['userProfile']),
                chrome.storage.local.get(['currentJobData'])
            ]);

            // Call backend API
            const settings = await chrome.storage.sync.get(['extensionSettings']);
            const backendUrl = settings.extensionSettings?.backendUrl || 'http://localhost:3000';

            const response = await fetch(`${backendUrl}/api/answer/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question: questionText,
                    context: '',
                    userProfile: userProfile.userProfile,
                    jobData: jobData.currentJobData
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Copy answer to clipboard
                await navigator.clipboard.writeText(result.answer);
                this.showNotification('AI answer copied to clipboard!', 'success');
            } else {
                throw new Error('Failed to generate answer');
            }
        } catch (error) {
            console.error('Error generating answer:', error);
            this.showNotification('Error generating answer: ' + error.message, 'error');
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
            background: ${type === 'success' ? '#4caf50' : type === 'info' ? '#2196f3' : '#f44336'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Initialize question detector
const questionDetector = new QuestionDetector();
