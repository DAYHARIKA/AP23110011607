/**
 * Logging Middleware for Campus Notifications Application
 * This is a reusable logging function that sends logs to the test server
 */

const LOG_API_URL = 'http://20.207.122.201/evaluation-service/logs';

/**
 * Log function - Sends log messages to the test server
 * @param {string} stack - 'backend' or 'frontend'
 * @param {string} level - 'debug', 'info', 'warn', 'error', 'fatal'
 * @param {string} pkg - Package name (e.g., 'api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils')
 * @param {string} message - Log message
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} - Response from the log API
 */
async function Log(stack, level, pkg, message, token) {
  try {
    const response = await fetch(LOG_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        stack: stack.toLowerCase(),
        level: level.toLowerCase(),
        package: pkg.toLowerCase(),
        message: message
      })
    });

    if (!response.ok) {
      console.error(`Logging failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending log:', error);
    return null;
  }
}

// For Node.js environment (CommonJS)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Log };
}

// For browser environment (ES Module)
if (typeof window !== 'undefined') {
  window.Log = Log;
}
