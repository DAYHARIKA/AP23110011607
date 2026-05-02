'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Typography, Button, Box, TextField, Alert } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleSetToken = () => {
    if (token.trim()) {
      localStorage.setItem('auth_token', token.trim());
      setError('');
      router.push('/notifications');
    } else {
      setError('Please enter a valid token');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Campus Notifications
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Enter your authorization token to access notifications
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Authorization Token"
          variant="outlined"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your Bearer token here"
          multiline
          rows={3}
        />
        
        {error && (
          <Alert severity="error">{error}</Alert>
        )}
        
        <Button
          variant="contained"
          size="large"
          onClick={handleSetToken}
          fullWidth
        >
          Access Notifications
        </Button>
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Note:</strong> You need to register and get an authorization token from the test server first.
        </Typography>
      </Box>
    </Container>
  );
}
