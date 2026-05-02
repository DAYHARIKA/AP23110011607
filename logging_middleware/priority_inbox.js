/**
 * Stage 1: Priority Inbox Implementation
 * This script fetches notifications and returns the top 10 based on priority
 * Priority is determined by weight (Placement > Result > Event) and recency
 */

const NOTIFICATIONS_API_URL = 'http://20.207.122.201/evaluation-service/notifications';
const { Log } = require('./logger.js');

// Priority weights
const PRIORITY_WEIGHTS = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

/**
 * Fetch notifications from the API
 * @param {string} token - Authorization token
 * @returns {Promise<Array>} - Array of notifications
 */
async function fetchNotifications(token) {
  try {
    const response = await fetch(NOTIFICATIONS_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch notifications: ${response.status}`);
    }

    const data = await response.json();
    return data.notifications || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Calculate priority score for a notification
 * Higher score = higher priority
 * @param {Object} notification - Notification object
 * @returns {number} - Priority score
 */
function calculatePriorityScore(notification) {
  const weight = PRIORITY_WEIGHTS[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  const currentTime = Date.now();
  
  // Recency factor: more recent = higher score (in hours)
  const hoursSince = (currentTime - timestamp) / (1000 * 60 * 60);
  const recencyFactor = Math.max(0, 100 - hoursSince); // Decreases with time
  
  // Combined score: weight * 1000 + recencyFactor
  // This ensures weight is the primary factor, recency is secondary
  return (weight * 1000) + recencyFactor;
}

/**
 * Get top N priority notifications
 * @param {Array} notifications - Array of notifications
 * @param {number} n - Number of top notifications to return
 * @returns {Array} - Top N priority notifications
 */
function getTopPriorityNotifications(notifications, n = 10) {
  // Sort by priority score (descending)
  const sorted = [...notifications].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // Higher score first
    }
    
    // If scores are equal, sort by timestamp (more recent first)
    return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
  });
  
  return sorted.slice(0, n);
}

/**
 * Main function to demonstrate priority inbox
 */
async function main() {
  // You need to replace this with your actual token from the auth API
  const TOKEN = 'YOUR_ACCESS_TOKEN_HERE';
  
  console.log('Fetching notifications...');
  await Log('frontend', 'info', 'api', 'Fetching notifications from API', TOKEN);
  
  const notifications = await fetchNotifications(TOKEN);
  console.log(`Total notifications: ${notifications.length}`);
  await Log('frontend', 'info', 'api', `Fetched ${notifications.length} notifications`, TOKEN);
  
  const top10 = getTopPriorityNotifications(notifications, 10);
  console.log('\n=== TOP 10 PRIORITY NOTIFICATIONS ===\n');
  
  top10.forEach((notification, index) => {
    console.log(`${index + 1}. [${notification.Type}] ${notification.Message}`);
    console.log(`   ID: ${notification.ID}`);
    console.log(`   Timestamp: ${notification.Timestamp}`);
    console.log(`   Priority Score: ${calculatePriorityScore(notification)}`);
    console.log('');
  });
  
  await Log('frontend', 'info', 'api', `Retrieved top ${top10.length} priority notifications`, TOKEN);
  
  return top10;
}

// Export functions for reuse
module.exports = {
  fetchNotifications,
  calculatePriorityScore,
  getTopPriorityNotifications,
  main
};

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}
