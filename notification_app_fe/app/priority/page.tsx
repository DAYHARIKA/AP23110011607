'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  TextField,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Log } from '../../utils/logger';

interface Notification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

const PRIORITY_WEIGHTS: { [key: string]: number } = {
  'Placement': 3,
  'Result': 2,
  'Event': 1
};

function calculatePriorityScore(notification: Notification): number {
  const weight = PRIORITY_WEIGHTS[notification.Type] || 0;
  const timestamp = new Date(notification.Timestamp).getTime();
  const currentTime = Date.now();
  const hoursSince = (currentTime - timestamp) / (1000 * 60 * 60);
  const recencyFactor = Math.max(0, 100 - hoursSince);
  return (weight * 1000) + recencyFactor;
}

function getTopPriorityNotifications(notifications: Notification[], n: number): Notification[] {
  const sorted = [...notifications].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);
    if (scoreA !== scoreB) return scoreB - scoreA;
    return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
  });
  return sorted.slice(0, n);
}

export default function PriorityPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [priorityNotifications, setPriorityNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState<number>(10);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      router.push('/');
      return;
    }
    setToken(savedToken);
    fetchNotifications(savedToken);
  }, [router]);

  useEffect(() => {
    const topN = getTopPriorityNotifications(notifications, limit);
    setPriorityNotifications(topN);
  }, [notifications, limit]);

  const fetchNotifications = async (authToken: string) => {
    try {
      setLoading(true);
      await Log('frontend', 'info', 'api', 'Fetching notifications for priority inbox', authToken);

      const response = await fetch('http://20.207.122.201/evaluation-service/notifications', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      await Log('frontend', 'info', 'api', `Fetched ${data.notifications?.length || 0} notifications`, authToken);
    } catch (err: any) {
      setError(err.message);
      await Log('frontend', 'error', 'api', `Error fetching notifications: ${err.message}`, token);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = (id: string) => {
    const viewed = JSON.parse(localStorage.getItem('viewed_notifications') || '[]');
    if (!viewed.includes(id)) {
      viewed.push(id);
      localStorage.setItem('viewed_notifications', JSON.stringify(viewed));
    }
  };

  const isViewed = (id: string) => {
    const viewed = JSON.parse(localStorage.getItem('viewed_notifications') || '[]');
    return viewed.includes(id);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Placement': return 'success';
      case 'Result': return 'warning';
      case 'Event': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => router.push('/notifications')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Priority Inbox
          </Typography>
          <Button color="inherit" onClick={() => router.push('/notifications')}>
            All Notifications
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Top N Notifications"
            type="number"
            value={limit}
            onChange={(e) => setLimit(Math.max(1, parseInt(e.target.value) || 10))}
            sx={{ width: 200 }}
          />
          <Typography variant="body2" color="text.secondary">
            Showing top {limit} priority notifications
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {!loading && !error && (
          <Grid container spacing={2}>
            {priorityNotifications.map((notification, index) => (
              <Grid item xs={12} md={6} key={notification.ID}>
                <Card
                  sx={{
                    borderLeft: isViewed(notification.ID) ? 'none' : '4px solid #1976d2',
                    cursor: 'pointer',
                    bgcolor: isViewed(notification.ID) ? 'background.paper' : '#e3f2fd',
                    position: 'relative'
                  }}
                  onClick={() => markAsViewed(notification.ID)}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {index + 1}
                  </Box>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, pr: 4 }}>
                      <Chip label={notification.Type} color={getTypeColor(notification.Type) as any} size="small" />
                      {!isViewed(notification.ID) && (
                        <Chip label="New" color="primary" size="small" />
                      )}
                    </Box>
                    <Typography variant="body1" gutterBottom>
                      {notification.Message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.Timestamp}
                    </Typography>
                    <Typography variant="caption" display="block" color="text.secondary">
                      Priority Score: {calculatePriorityScore(notification).toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && !error && priorityNotifications.length === 0 && (
          <Alert severity="info">No notifications found</Alert>
        )}
      </Container>
    </Box>
  );
}
