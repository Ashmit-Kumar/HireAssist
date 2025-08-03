// Prompt construction utilities for client-side processing

class PromptsUtils {
    // Generate prompts for different types of requests
    static generateCoverLetterPrompt(jobData, userProfile, resumeData) {
        return `
Please generate a professional cover letter based on the following information:

JOB INFORMATION:
- Position: ${jobData?.title || 'Not specified'}
- Company: ${jobData?.company || 'Not specified'}
- Location: ${jobData?.location || 'Not specified'}
- Requirements: ${jobData?.requirements?.join(', ') || 'Not specified'}
- Key Skills: ${jobData?.skills?.join(', ') || 'Not specified'}

CANDIDATE INFORMATION:
- Name: ${userProfile?.fullName || 'Not specified'}
- Email: ${userProfile?.email || 'Not specified'}
- Phone: ${userProfile?.phone || 'Not specified'}
- LinkedIn: ${userProfile?.linkedin || 'Not specified'}

RESUME HIGHLIGHTS:
${resumeData ? JSON.stringify(resumeData, null, 2) : 'Resume data not available'}

Please create a compelling cover letter that:
1. Addresses the specific role and company
2. Highlights relevant experience and skills
3. Shows enthusiasm and cultural fit
4. Maintains a professional tone
5. Is approximately 3-4 paragraphs

Format the response as plain text without special formatting.
        `.trim();
    }

    static generateAnswerPrompt(question, context, userProfile, jobData, resumeData) {
        return `
Please generate a compelling answer for the following application question:

QUESTION: ${question}

CONTEXT: ${context || 'No additional context provided'}

JOB INFORMATION:
- Position: ${jobData?.title || 'Not specified'}
- Company: ${jobData?.company || 'Not specified'}
- Requirements: ${jobData?.requirements?.join(', ') || 'Not specified'}
- Key Skills: ${jobData?.skills?.join(', ') || 'Not specified'}

CANDIDATE BACKGROUND:
${resumeData ? JSON.stringify(resumeData, null, 2) : 'Resume data not available'}

PERSONAL INFO:
- Name: ${userProfile?.fullName || 'Not specified'}
- Professional Profile: ${userProfile?.linkedin || 'Not specified'}

Please provide an answer that:
1. Directly addresses the question
2. Uses specific examples from the candidate's experience
3. Aligns with the job requirements
4. Demonstrates value to the employer
5. Is concise but comprehensive (2-3 paragraphs)
6. Shows personality while maintaining professionalism

Format as a clear, professional response suitable for copy-pasting into an application form.
        `.trim();
    }

    static generateResumeOptimizationPrompt(resumeData, jobData) {
        return `
Please analyze and optimize the following resume for the given job description:

JOB DESCRIPTION:
- Position: ${jobData?.title || 'Not specified'}
- Company: ${jobData?.company || 'Not specified'}
- Requirements: ${jobData?.requirements?.join('\n- ') || 'Not specified'}
- Key Skills: ${jobData?.skills?.join(', ') || 'Not specified'}
- Full Description: ${jobData?.description || 'Not available'}

CURRENT RESUME:
${resumeData ? JSON.stringify(resumeData, null, 2) : 'Resume data not available'}

Please provide optimization suggestions that:
1. Identify keywords to add from the job description
2. Suggest skills to emphasize more prominently
3. Recommend experience points to expand or restructure
4. Highlight any missing qualifications
5. Suggest formatting improvements
6. Maintain truthfulness and accuracy

Format the response as actionable suggestions with explanations.
        `.trim();
    }

    static generateOptimizationSuggestionsPrompt(resumeData, jobData) {
        return `
Analyze the alignment between this resume and job description, then provide specific optimization suggestions:

JOB REQUIREMENTS:
${jobData?.requirements?.join('\n') || 'Not specified'}

KEY SKILLS NEEDED:
${jobData?.skills?.join(', ') || 'Not specified'}

CURRENT RESUME:
${resumeData ? JSON.stringify(resumeData, null, 2) : 'Resume data not available'}

Please provide:
1. Keyword gap analysis
2. Skills alignment score
3. Experience relevance assessment
4. Specific recommendations for improvement
5. Priority order for changes

Format as a structured analysis with actionable next steps.
        `.trim();
    }

    static generateQuestionSuggestionsPrompt(question, context) {
        return `
Provide guidance for answering the following application question:

QUESTION: ${question}

CONTEXT: ${context || 'No additional context provided'}

Please provide:
1. Key points to address in the answer
2. Structure suggestions for the response
3. Examples of strong answer approaches
4. Common mistakes to avoid
5. Tips for making the answer stand out
6. Recommended length and tone

Format as actionable advice for crafting a compelling response.
        `.trim();
    }

    // Utility methods for prompt enhancement
    static addJobDescriptionContext(prompt, jobDescription) {
        if (!jobDescription) return prompt;
        
        return prompt + `\n\nADDITIONAL JOB CONTEXT:\n${jobDescription.substring(0, 1000)}`;
    }

    static addResumeContext(prompt, resumeText) {
        if (!resumeText) return prompt;
        
        return prompt + `\n\nRESUME TEXT:\n${resumeText.substring(0, 2000)}`;
    }

    static cleanPrompt(prompt) {
        // Remove extra whitespace and normalize line breaks
        return prompt
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove triple+ line breaks
            .replace(/\s+/g, ' ') // Normalize spaces
            .trim();
    }

    static truncateToTokenLimit(text, maxTokens = 3000) {
        // Rough estimate: 1 token ≈ 4 characters
        const maxChars = maxTokens * 4;
        
        if (text.length <= maxChars) {
            return text;
        }
        
        // Truncate at word boundary
        const truncated = text.substring(0, maxChars);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }

    // Template methods for common prompt patterns
    static createSystemPrompt(role, instructions) {
        return `You are a ${role}. ${instructions}

Please follow these guidelines:
- Be specific and actionable
- Use professional language
- Focus on value and impact
- Keep responses concise but comprehensive
- Maintain accuracy and truthfulness`;
    }

    static createFewShotPrompt(examples, newQuery) {
        let prompt = "Here are some examples of high-quality responses:\n\n";
        
        examples.forEach((example, index) => {
            prompt += `Example ${index + 1}:\n`;
            prompt += `Question: ${example.question}\n`;
            prompt += `Answer: ${example.answer}\n\n`;
        });
        
        prompt += `Now please answer this question:\n${newQuery}`;
        
        return prompt;
    }

    // Validation methods
    static validatePromptData(data) {
        const errors = [];
        
        if (!data.question && !data.jobData && !data.resumeData) {
            errors.push('At least one of question, jobData, or resumeData is required');
        }
        
        if (data.userProfile && !data.userProfile.fullName) {
            errors.push('User profile should include a full name');
        }
        
        return errors;
    }

    static estimateTokenCount(text) {
        // Rough estimation: 1 token ≈ 4 characters for English text
        return Math.ceil(text.length / 4);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PromptsUtils;
} else {
    window.PromptsUtils = PromptsUtils;
}
