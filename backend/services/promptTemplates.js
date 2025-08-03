class PromptTemplates {
  coverLetterPrompt({ jobDescription, resumeData, personalInfo }) {
    return `
Generate a professional cover letter based on the following information:

Job Description:
${jobDescription}

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Personal Information:
${JSON.stringify(personalInfo, null, 2)}

Please create a compelling cover letter that:
1. Addresses the specific job requirements
2. Highlights relevant experience from the resume
3. Shows enthusiasm for the role and company
4. Maintains a professional tone
5. Is approximately 3-4 paragraphs long

Format the response as plain text without any special formatting.`;
  }

  resumeOptimizationPrompt({ resumeData, jobDescription }) {
    return `
Optimize the following resume for the given job description:

Job Description:
${jobDescription}

Current Resume:
${JSON.stringify(resumeData, null, 2)}

Please provide an optimized version that:
1. Uses keywords from the job description
2. Emphasizes relevant skills and experience
3. Restructures content for better alignment with job requirements
4. Maintains truthfulness and accuracy
5. Improves overall presentation

Return the optimized resume in a structured format.`;
  }

  answerGenerationPrompt({ question, context, resumeData, jobDescription }) {
    return `
Generate a compelling answer for the following application question:

Question: ${question}

Context: ${context || 'No additional context provided'}

Job Description:
${jobDescription}

Candidate's Resume:
${JSON.stringify(resumeData, null, 2)}

Please provide an answer that:
1. Directly addresses the question
2. Uses specific examples from the candidate's experience
3. Aligns with the job requirements
4. Demonstrates value to the employer
5. Is concise but comprehensive

Format the response as a clear, professional answer.`;
  }

  optimizationSuggestionsPrompt({ resumeData, jobDescription }) {
    return `
Analyze the resume against the job description and provide optimization suggestions:

Job Description:
${jobDescription}

Resume:
${JSON.stringify(resumeData, null, 2)}

Please provide specific suggestions for:
1. Keywords to add or emphasize
2. Skills to highlight more prominently
3. Experience to expand or restructure
4. Sections to add or remove
5. Overall formatting improvements

Return suggestions as a structured list with explanations.`;
  }

  answerSuggestionsPrompt({ question, context }) {
    return `
Provide suggestions for answering the following application question:

Question: ${question}

Context: ${context || 'No additional context provided'}

Please provide:
1. Key points to address in the answer
2. Structure suggestions for the response
3. Examples of strong answer approaches
4. Common mistakes to avoid
5. Tips for making the answer stand out

Format as actionable suggestions.`;
  }
}

module.exports = new PromptTemplates();
