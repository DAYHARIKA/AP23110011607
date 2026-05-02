/**
 * Logging Middleware for Frontend Application
 * This is a reusable logging function that sends logs to the test server
 */

const LOG_API_URL = '/api/evaluation-service/logs';

/**
 * Log function - Sends log messages to the test server
 * @param stack - 'backend' or 'frontend'
 * @param level - 'debug', 'info', 'warn', 'error', 'fatal'
 * @param pkg - Package name (e.g., 'api', 'component', 'hook', 'page', 'state', 'style', 'auth', 'config', 'middleware', 'utils')
 * @param message - Log message
 * @param token - Authorization token
 */
export async function Log(
  stack: string,
  level: string,
  pkg: string,
  message: string,
  token: string
): Promise<any> {
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
