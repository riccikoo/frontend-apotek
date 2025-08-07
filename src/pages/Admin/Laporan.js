import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow 
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import api from '../../services/Api';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const LaporanPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/laporan/mingguan');
      setData(response.data);
    } catch (error) {
      console.error('Gagal mengambil data laporan:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: data?.transaksi.map(t => new Date(t.tanggal).toLocaleDateString()),
    datasets: [
      {
        label: 'Penjualan Harian',
        data: data?.transaksi.map(t => t.total),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Laporan Mingguan
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Statistik
        </Typography>
        {data && (
          <>
            <Typography>Total Penjualan: Rp {data.total_penjualan.toLocaleString()}</Typography>
            <Typography>Total Barang Terjual: {data.total_barang_terjual}</Typography>
          </>
        )}
      </Paper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Grafik Penjualan
        </Typography>
        {data && (
          <Box sx={{ height: '400px' }}>
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false 
              }} 
            />
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Detail Transaksi
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tanggal</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Kasir</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.transaksi.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{new Date(t.tanggal).toLocaleDateString()}</TableCell>
                  <TableCell>Rp {t.total.toLocaleString()}</TableCell>
                  <TableCell>{t.kasir}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default LaporanPage;