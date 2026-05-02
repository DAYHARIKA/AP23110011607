/**
 * Backend Server for Campus Notifications Application
 * Serves as a proxy to the test server APIs
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { Log } = require('../logging_middleware/logger.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test Server URLs
const TEST_SERVER_BASE = 'http://20.207.122.201/evaluation-service';

/**
 * Proxy endpoint to fetch notifications
 */
app.get('/api/notifications', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      await Log('backend', 'error', 'middleware', 'Missing authorization token', token);
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { limit, page, notification_type } = req.query;
    
    // Build query string
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit);
    if (page) queryParams.append('page', page);
    if (notification_type) queryParams.append('notification_type', notification_type);
    
    const queryString = queryParams.toString();
    const url = `${TEST_SERVER_BASE}/notifications${queryString ? '?' + queryString : ''}`;
    
    await Log('backend', 'info', 'api', `Fetching notifications with params: ${queryString || 'none'}`, token);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      await Log('backend', 'error', 'api', `Failed to fetch notifications: ${response.status}`, token);
      return res.status(response.status).json({ error: 'Failed to fetch notifications' });
    }
    
    const data = await response.json();
    await Log('backend', 'info', 'api', `Successfully fetched ${data.notifications?.length || 0} notifications`, token);
    
    res.json(data);
  } catch (error) {
    await Log('backend', 'error', 'api', `Error fetching notifications: ${error.message}`, req.headers.authorization?.replace('Bearer ', ''));
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Proxy endpoint to send logs
 */
app.post('/api/logs', async (req, res) => {
  try {
    const { stack, level, package: pkg, message } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    await Log('backend', 'info', 'middleware', `Log request received: ${level} - ${pkg}`, token);
    
    const response = await fetch(`${TEST_SERVER_BASE}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ stack, level, package: pkg, message })
    });
    
    if (!response.ok) {
      await Log('backend', 'error', 'api', `Failed to send log: ${response.status}`, token);
      return res.status(response.status).json({ error: 'Failed to send log' });
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    await Log('backend', 'error', 'api', `Error sending log: ${error.message}`, req.headers.authorization?.replace('Bearer ', ''));
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  Log('backend', 'info', 'config', `Backend server started on port ${PORT}`, process.env.AUTH_TOKEN || '');
});

module.exports = app;
