const express = require('express');
const router = express.Router();
const llmService = require('../services/llmService');

// Generate answer for application question
router.post('/generate', async (req, res) => {
  try {
    const { question, context, resumeData, jobDescription } = req.body;
    
    // TODO: Implement answer generation using LLM
    const answer = await llmService.generateAnswer({
      question,
      context,
      resumeData,
      jobDescription
    });
    
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate answer' });
  }
});

// Get answer suggestions
router.post('/suggestions', async (req, res) => {
  try {
    const { question, context } = req.body;
    
    // TODO: Implement answer suggestions
    const suggestions = await llmService.getAnswerSuggestions({
      question,
      context
    });
    
    res.json({ suggestions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get answer suggestions' });
  }
});

module.exports = router;
