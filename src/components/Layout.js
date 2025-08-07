import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ role }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = {
    admin: [
      { path: '/admin', label: 'Dashboard' },
      { path: '/admin/obat', label: 'Obat' },
      { path: '/admin/pegawai', label: 'Pegawai' },
      { path: '/admin/laporan', label: 'Laporan' }
    ],
    kasir: [
      { path: '/kasir', label: 'Dashboard' },
      { path: '/kasir/transaksi', label: 'Transaksi' }
    ]
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Apotek {role === 'admin' ? 'Admin' : 'Kasir'}
          </Typography>
          {navItems[role].map((item) => (
            <Button 
              key={item.path} 
              color="inherit" 
              component={Link} 
              to={item.path}
            >
              {item.label}
            </Button>
          ))}
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
      
      <Box component="footer" sx={{ py: 3, px: 2, backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Apotek App
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;