import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Modal, TextField, Dialog,
  DialogActions, DialogContent, DialogTitle, Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import api from '../../services/Api';

const AdminPegawai = () => {
  const [pegawai, setPegawai] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentPegawai, setCurrentPegawai] = useState(null);
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchPegawai();
  }, []);

  const fetchPegawai = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pegawai');
      setPegawai(response.data);
    } catch (err) {
      setError('Gagal memuat data pegawai');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editMode && currentPegawai) {
        await api.put(`/admin/pegawai/${currentPegawai.id}`, form);
      } else {
        await api.post('/admin/pegawai', form);
      }
      setOpenModal(false);
      setForm({ username: '', password: '' });
      fetchPegawai();
    } catch (err) {
      setError(err.response?.data?.msg || 'Terjadi kesalahan');
      console.error(err);
    }
  };

  const handleEdit = (pegawai) => {
    setCurrentPegawai(pegawai);
    setForm({
      username: pegawai.username,
      password: '' // Password dikosongkan saat edit
    });
    setEditMode(true);
    setOpenModal(true);
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/admin/pegawai/${currentPegawai.id}`);
      setDeleteConfirm(false);
      fetchPegawai();
    } catch (err) {
      setError('Gagal menghapus pegawai');
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm({ username: '', password: '' });
    setEditMode(false);
    setCurrentPegawai(null);
    setOpenModal(false);
    setError('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Manajemen Pegawai</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenModal(true)}
        >
          Tambah Pegawai
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pegawai.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.username}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(row)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => {
                    setCurrentPegawai(row);
                    setDeleteConfirm(true);
                  }}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Tambah/Edit Pegawai */}
      <Modal open={openModal} onClose={resetForm}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1
        }}>
          <Typography variant="h6" mb={2}>
            {editMode ? 'Edit Pegawai' : 'Tambah Pegawai'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleInputChange}
              margin="normal"
              required={!editMode}
              helperText={editMode ? "Kosongkan jika tidak ingin mengubah password" : ""}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={resetForm} sx={{ mr: 1 }}>Batal</Button>
              <Button type="submit" variant="contained">
                Simpan
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          Apakah Anda yakin ingin menghapus pegawai {currentPegawai?.username}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Batal</Button>
          <Button onClick={handleDelete} color="error">Hapus</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPegawai;