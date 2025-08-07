// src/pages/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Avatar } from '@mui/material';
import { Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth(); // Gunakan useAuth()
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await auth.login(username, password);
      
      if (result.success) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/kasir');
        }
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Paper elevation={3} sx={{ p: 4, width: 400 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <LockIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Login Apotek
          </Typography>
        </Box>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;