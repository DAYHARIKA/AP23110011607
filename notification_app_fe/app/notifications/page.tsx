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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('all');
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
    if (filter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(n => n.Type === filter));
    }
  }, [filter, notifications]);

  const fetchNotifications = async (authToken: string) => {
    try {
      setLoading(true);
      await Log('frontend', 'info', 'api', 'Fetching notifications', authToken);

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
          <IconButton edge="start" color="inherit" onClick={() => router.push('/')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            All Notifications
          </Typography>
          <Button color="inherit" onClick={() => router.push('/priority')}>
            Priority Inbox
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filter}
              label="Filter by Type"
              onChange={(e) => setFilter(e.target.value)}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="Placement">Placement</MenuItem>
              <MenuItem value="Result">Result</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
            </Select>
          </FormControl>
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
            {filteredNotifications.map((notification) => (
              <Grid item xs={12} md={6} key={notification.ID}>
                <Card
                  sx={{
                    borderLeft: isViewed(notification.ID) ? 'none' : '4px solid #1976d2',
                    cursor: 'pointer',
                    bgcolor: isViewed(notification.ID) ? 'background.paper' : '#e3f2fd'
                  }}
                  onClick={() => markAsViewed(notification.ID)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <Alert severity="info">No notifications found</Alert>
        )}
      </Container>
    </Box>
  );
}
