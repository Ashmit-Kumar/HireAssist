/**
 * Logger utility for the application
 * Ye file logging functionality provide karta hai
 * Approach: Console logging with timestamps and colors for development
 */

const colors = {
  info: '\x1b[36m',    // Cyan
  error: '\x1b[31m',   // Red
  warn: '\x1b[33m',    // Yellow
  success: '\x1b[32m', // Green
  reset: '\x1b[0m'     // Reset color
};

/**
 * Get current timestamp in readable format
 * Ye function current time ko readable format me return karta hai
 * Approach: ISO string ko local time format me convert karta hai
 */
function getTimestamp() {
  return new Date().toISOString().replace('T', ' ').substr(0, 19);
}

/**
 * Format log message with timestamp and color
 * Ye function log message ko properly format karta hai
 * Approach: Timestamp + color + message + reset color
 */
function formatMessage(level, message, data = null) {
  const timestamp = getTimestamp();
  const color = colors[level] || colors.reset;
  const formattedMessage = `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${colors.reset}`;
  
  if (data) {
    return `${formattedMessage}\n${JSON.stringify(data, null, 2)}`;
  }
  
  return formattedMessage;
}

/**
 * Logger object with different log levels
 * Ye object different types ke logs ke liye methods provide karta hai
 * Approach: Each method formats message and logs to console
 */
const logger = {
  /**
   * Log info level messages
   * General information ke liye use karta hai
   */
  info: (message, data = null) => {
    console.log(formatMessage('info', message, data));
  },

  /**
   * Log error level messages
   * Errors aur exceptions ke liye use karta hai
   */
  error: (message, data = null) => {
    console.error(formatMessage('error', message, data));
  },

  /**
   * Log warning level messages
   * Warnings aur potential issues ke liye use karta hai
   */
  warn: (message, data = null) => {
    console.warn(formatMessage('warn', message, data));
  },

  /**
   * Log success level messages
   * Successful operations ke liye use karta hai
   */
  success: (message, data = null) => {
    console.log(formatMessage('success', message, data));
  },

  /**
   * Log debug level messages (only in development)
   * Development debugging ke liye use karta hai
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage('info', `DEBUG: ${message}`, data));
    }
  }
};

module.exports = logger;
