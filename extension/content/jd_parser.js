// Job description parser for extracting job requirements

class JobDescriptionParser {
    constructor() {
        this.jobData = null;
        this.init();
    }

    init() {
        this.setupParser();
    }

    setupParser() {
        // Auto-detect job descriptions when page loads
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.detectJobDescription());
        } else {
            this.detectJobDescription();
        }
    }

    detectJobDescription() {
        const jobData = this.parseCurrentPage();
        if (jobData) {
            this.jobData = jobData;
            this.saveJobData(jobData);
            console.log('Job description detected:', jobData);
        }
    }

    parseCurrentPage() {
        const url = window.location.href;
        
        if (url.includes('linkedin.com/jobs')) {
            return this.parseLinkedIn();
        } else if (url.includes('indeed.com')) {
            return this.parseIndeed();
        } else if (url.includes('glassdoor.com')) {
            return this.parseGlassdoor();
        } else if (url.includes('workday.com')) {
            return this.parseWorkday();
        } else {
            return this.parseGeneric();
        }
    }

    parseLinkedIn() {
        try {
            const jobTitle = document.querySelector('.t-24.t-bold')?.textContent?.trim() ||
                           document.querySelector('h1')?.textContent?.trim();
            
            const company = document.querySelector('.jobs-unified-top-card__company-name a')?.textContent?.trim() ||
                          document.querySelector('.jobs-unified-top-card__company-name')?.textContent?.trim();
            
            const location = document.querySelector('.jobs-unified-top-card__bullet')?.textContent?.trim();
            
            const description = document.querySelector('.jobs-description__content')?.textContent?.trim() ||
                              document.querySelector('[data-module-id="job-details"]')?.textContent?.trim();
            
            const requirements = this.extractRequirements(description);
            const skills = this.extractSkills(description);
            
            return {
                title: jobTitle,
                company: company,
                location: location,
                description: description,
                requirements: requirements,
                skills: skills,
                source: 'LinkedIn',
                url: window.location.href,
                dateFound: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing LinkedIn job:', error);
            return null;
        }
    }

    parseIndeed() {
        try {
            const jobTitle = document.querySelector('[data-testid="jobsearch-JobInfoHeader-title"]')?.textContent?.trim() ||
                           document.querySelector('h1')?.textContent?.trim();
            
            const company = document.querySelector('[data-testid="inlineHeader-companyName"]')?.textContent?.trim();
            
            const location = document.querySelector('[data-testid="job-location"]')?.textContent?.trim();
            
            const description = document.querySelector('#jobDescriptionText')?.textContent?.trim() ||
                              document.querySelector('.jobsearch-jobDescriptionText')?.textContent?.trim();
            
            const requirements = this.extractRequirements(description);
            const skills = this.extractSkills(description);
            
            return {
                title: jobTitle,
                company: company,
                location: location,
                description: description,
                requirements: requirements,
                skills: skills,
                source: 'Indeed',
                url: window.location.href,
                dateFound: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing Indeed job:', error);
            return null;
        }
    }

    parseGlassdoor() {
        try {
            const jobTitle = document.querySelector('[data-test="job-title"]')?.textContent?.trim() ||
                           document.querySelector('h1')?.textContent?.trim();
            
            const company = document.querySelector('[data-test="employer-name"]')?.textContent?.trim();
            
            const location = document.querySelector('[data-test="job-location"]')?.textContent?.trim();
            
            const description = document.querySelector('[data-test="jobDescriptionContent"]')?.textContent?.trim() ||
                              document.querySelector('.desc')?.textContent?.trim();
            
            const requirements = this.extractRequirements(description);
            const skills = this.extractSkills(description);
            
            return {
                title: jobTitle,
                company: company,
                location: location,
                description: description,
                requirements: requirements,
                skills: skills,
                source: 'Glassdoor',
                url: window.location.href,
                dateFound: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing Glassdoor job:', error);
            return null;
        }
    }

    parseWorkday() {
        try {
            const jobTitle = document.querySelector('[data-automation-id="jobPostingHeader"]')?.textContent?.trim() ||
                           document.querySelector('h1')?.textContent?.trim();
            
            const company = document.querySelector('[data-automation-id="company"]')?.textContent?.trim();
            
            const location = document.querySelector('[data-automation-id="locations"]')?.textContent?.trim();
            
            const description = document.querySelector('[data-automation-id="jobPostingDescription"]')?.textContent?.trim();
            
            const requirements = this.extractRequirements(description);
            const skills = this.extractSkills(description);
            
            return {
                title: jobTitle,
                company: company,
                location: location,
                description: description,
                requirements: requirements,
                skills: skills,
                source: 'Workday',
                url: window.location.href,
                dateFound: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing Workday job:', error);
            return null;
        }
    }

    parseGeneric() {
        try {
            // Generic parsing for other job sites
            const jobTitle = document.querySelector('h1')?.textContent?.trim() ||
                           document.querySelector('[class*="job"][class*="title"], [class*="title"][class*="job"]')?.textContent?.trim();
            
            const company = document.querySelector('[class*="company"]')?.textContent?.trim();
            
            const location = document.querySelector('[class*="location"]')?.textContent?.trim();
            
            // Look for the largest text block (likely the description)
            const textBlocks = Array.from(document.querySelectorAll('div, section, article'))
                .map(el => el.textContent?.trim())
                .filter(text => text && text.length > 200)
                .sort((a, b) => b.length - a.length);
            
            const description = textBlocks[0] || '';
            
            const requirements = this.extractRequirements(description);
            const skills = this.extractSkills(description);
            
            return {
                title: jobTitle,
                company: company,
                location: location,
                description: description,
                requirements: requirements,
                skills: skills,
                source: 'Generic',
                url: window.location.href,
                dateFound: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error parsing generic job:', error);
            return null;
        }
    }

    extractRequirements(description) {
        if (!description) return [];
        
        const requirementPatterns = [
            /(?:requirements?|qualifications?|must have|required)[:\s]*([^.!?]*)/gi,
            /(?:experience|years?)[:\s]+([^.!?]*)/gi,
            /(?:degree|education|bachelor|master)[:\s]*([^.!?]*)/gi
        ];
        
        const requirements = [];
        
        requirementPatterns.forEach(pattern => {
            const matches = description.matchAll(pattern);
            for (const match of matches) {
                if (match[1] && match[1].trim().length > 10) {
                    requirements.push(match[1].trim());
                }
            }
        });
        
        return requirements;
    }

    extractSkills(description) {
        if (!description) return [];
        
        const commonSkills = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
            'TypeScript', 'AWS', 'Docker', 'Git', 'Agile', 'Scrum', 'REST API',
            'GraphQL', 'MongoDB', 'PostgreSQL', 'Redux', 'Vue.js', 'Angular',
            'Express', 'Spring', 'Django', 'Flask', 'Kubernetes', 'Jenkins',
            'CI/CD', 'Machine Learning', 'Data Analysis', 'TensorFlow', 'PyTorch',
            'Excel', 'PowerBI', 'Tableau', 'Salesforce', 'Adobe', 'Figma'
        ];
        
        const foundSkills = [];
        const lowerDescription = description.toLowerCase();
        
        commonSkills.forEach(skill => {
            if (lowerDescription.includes(skill.toLowerCase())) {
                foundSkills.push(skill);
            }
        });
        
        return foundSkills;
    }

    async saveJobData(jobData) {
        try {
            await chrome.storage.local.set({
                currentJobData: jobData,
                lastJobUpdate: new Date().toISOString()
            });
            console.log('Job data saved to storage');
        } catch (error) {
            console.error('Error saving job data:', error);
        }
    }

    async getJobData() {
        try {
            const data = await chrome.storage.local.get(['currentJobData']);
            return data.currentJobData;
        } catch (error) {
            console.error('Error getting job data:', error);
            return null;
        }
    }
}

// Global function for popup integration
window.parseJobDescription = function() {
    const parser = new JobDescriptionParser();
    parser.detectJobDescription();
    return parser.jobData;
};

// Initialize parser
const jobParser = new JobDescriptionParser();
