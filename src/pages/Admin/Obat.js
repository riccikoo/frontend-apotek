import React, { useState, useEffect } from 'react';
import {
  Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper,
  IconButton, Typography, Modal, TextField
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import api from '../../services/Api';

const AdminObat = () => {
  const [obat, setObat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [detailObat, setDetailObat] = useState(null);
  const [form, setForm] = useState({
    id: null,
    nama: '',
    stok: '',
    harga_satuan: ''
  });
  const [gambarFile, setGambarFile] = useState(null);
  const baseURL = api.defaults.baseURL.replace('/api', '');

  useEffect(() => {
    fetchObat();
  }, []);

  const fetchObat = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/obat');
      // Add full image URL to each obat item
      const obatWithImageUrls = response.data.map(item => ({
        ...item,
        gambar: item.gambar ? `${baseURL}/${item.gambar}` : null
      }));
      setObat(obatWithImageUrls);
    } catch (error) {
      console.error('Error fetching obat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/obat/${id}`);
      fetchObat();
    } catch (error) {
      console.error('Error deleting obat:', error);
    }
  };

  const handleInputChange = (e) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value
  });
};

const handleFileChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    setGambarFile(e.target.files[0]);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append('nama', form.nama);
  formData.append('stok', form.stok);
  formData.append('harga_satuan', form.harga_satuan);
  if (gambarFile) formData.append('gambar', gambarFile);

  try {
    if (editMode && form.id) {
      // Use PUT for updates
      await api.put(`/admin/obat/${form.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } else {
      // Use POST for new entries
      await api.post('/admin/obat', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }

    setOpenModal(false);
    setForm({ id: null, nama: '', stok: '', harga_satuan: '' });
    setGambarFile(null);
    setEditMode(false);
    fetchObat();
  } catch (error) {
    console.error('Error saving obat:', error.response?.data || error.message);
    // Add error notification to user here
  }
};

const handleEdit = (obat) => {
  setForm({
    id: obat.id,
    nama: obat.nama,
    stok: obat.stok,
    harga_satuan: obat.harga_satuan
  });
  setEditMode(true);
  setOpenModal(true);
  setGambarFile(null); // Reset gambar file when editing
};

const handleView = (obat) => {
  setDetailObat(obat);
};

  const closeDetail = () => setDetailObat(null);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Manajemen Obat</Typography>
        <Button variant="contained" onClick={() => setOpenModal(true)}>Tambah Obat</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama</TableCell>
              <TableCell>Stok</TableCell>
              <TableCell>Harga</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {obat.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.nama}</TableCell>
                <TableCell>{row.stok}</TableCell>
                <TableCell>Rp {parseFloat(row.harga_satuan).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleView(row)}><Visibility /></IconButton>
                  <IconButton onClick={() => handleEdit(row)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(row.id)}><Delete color="error" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Tambah/Edit Obat */}
      <Modal open={openModal} onClose={() => { setOpenModal(false); setEditMode(false); }}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, borderRadius: 2, p: 4 }}>
          <Typography variant="h6" mb={2}>{editMode ? 'Edit Obat' : 'Tambah Obat'}</Typography>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth name="nama" label="Nama Obat" value={form.nama} onChange={handleInputChange} margin="normal" required />
            <TextField fullWidth name="stok" label="Stok" type="number" value={form.stok} onChange={handleInputChange} margin="normal" required />
            <TextField fullWidth name="harga_satuan" label="Harga Satuan" type="number" value={form.harga_satuan} onChange={handleInputChange} margin="normal" required />
            <Box mt={2}><input type="file" accept="image/*" onChange={handleFileChange} /></Box>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setOpenModal(false)} sx={{ mr: 1 }}>Batal</Button>
              <Button type="submit" variant="contained">Simpan</Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Modal Detail Obat */}
      <Modal open={!!detailObat} onClose={closeDetail}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, borderRadius: 2, p: 4 }}>
          <Typography variant="h6" mb={2}>Detail Obat</Typography>
          {detailObat && (
            <Box>
              <Typography><strong>Nama:</strong> {detailObat.nama}</Typography>
              <Typography><strong>Stok:</strong> {detailObat.stok}</Typography>
              <Typography><strong>Harga:</strong> Rp {parseFloat(detailObat.harga_satuan).toLocaleString()}</Typography>
              {detailObat.gambar && (
                <img
                  src={detailObat.gambar}
                  alt={detailObat.nama}
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '200px',
                    display: 'block',
                    margin: '10px auto',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/200?text=Gambar+Tidak+Tersedia';
                  }}
                />
              )}
              <Box mt={2} textAlign="right">
                <Button onClick={closeDetail}>Tutup</Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminObat;
