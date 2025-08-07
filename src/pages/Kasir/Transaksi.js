import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, Collapse, IconButton
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import api from '../../services/Api';

const Row = ({ row }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>{row.tanggal}</TableCell>
        <TableCell>Rp {parseFloat(row.total_harga).toLocaleString()}</TableCell>
        <TableCell>{row.user_id}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box margin={1}>
              <Typography variant="subtitle1" gutterBottom component="div">
                Detail Transaksi
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Nama Obat</TableCell>
                    <TableCell>Jumlah</TableCell>
                    <TableCell>Harga Satuan</TableCell>
                    <TableCell>Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>{detail.nama_obat}</TableCell>
                      <TableCell>{detail.jumlah}</TableCell>
                      <TableCell>Rp {parseFloat(detail.harga_satuan).toLocaleString()}</TableCell>
                      <TableCell>Rp {parseFloat(detail.subtotal).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const KasirTransaksi = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransaksi();
  }, []);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kasir/transaksi');
      setTransaksi(response.data);
    } catch (error) {
      console.error('Gagal mengambil transaksi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Transaksi Hari Ini</Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Tanggal</TableCell>
                <TableCell>Total Harga</TableCell>
                <TableCell>ID Kasir</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transaksi.length > 0 ? transaksi.map((row) => (
                <Row key={row.id} row={row} />
              )) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">Tidak ada transaksi hari ini.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default KasirTransaksi;
