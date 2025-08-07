import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Auth/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminObat from './pages/Admin/Obat';
import AdminPegawai from './pages/Admin/Pegawai';
import AdminLaporan from './pages/Admin/Laporan';
import KasirDashboard from './pages/Kasir/Dashboard';
import KasirTransaksi from './pages/Kasir/Transaksi';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<PrivateRoute role="admin" />}>
          <Route element={<Layout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="obat" element={<AdminObat />} />
            <Route path="pegawai" element={<AdminPegawai />} />
            <Route path="laporan" element={<AdminLaporan />} />
          </Route>
        </Route>
        
        {/* Kasir Routes */}
        <Route path="/kasir" element={<PrivateRoute role="kasir" />}>
          <Route element={<Layout role="kasir" />}>
            <Route index element={<KasirDashboard />} />
            <Route path="transaksi" element={<KasirTransaksi />} />
          </Route>
        </Route>
        
        {/* Default Redirect */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;