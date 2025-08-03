const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/user', require('./routes/user'));
app.use('/api/resume', require('./routes/resume'));
app.use('/api/cover-letter', require('./routes/coverLetter'));
app.use('/api/optimize', require('./routes/optimize'));
app.use('/api/answer', require('./routes/answer'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'HireAssist Backend is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
