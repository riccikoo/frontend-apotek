import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Paper, Typography, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Badge, Divider, Chip, Alert, Snackbar
} from '@mui/material';
import {
  PointOfSale as PointOfSaleIcon,
  ShoppingCart as ShoppingCartIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Clear as ClearIcon,
  Print as PrintIcon,
  Paid as PaidIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import api from '../../services/Api';

const KasirTransaksi = () => {
  // State for products and cart
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch products and transactions on component mount
  useEffect(() => {
    fetchProducts();
    fetchTransactions();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/kasir/obat');
      setProducts(response.data);
    } catch (err) {
      setError('Gagal memuat data obat');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/kasir/transaksi');
      setTransactions(response.data);
    } catch (err) {
      setError('Gagal memuat riwayat transaksi');
      console.error(err);
    }
  };

  // Cart operations
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.obat_id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.obat_id === product.id 
            ? { ...item, jumlah: item.jumlah + 1 } 
            : item
        );
      } else {
        return [...prevCart, { 
          obat_id: product.id,
          nama: product.nama,
          harga_satuan: product.harga_satuan,
          jumlah: 1 
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.obat_id !== productId));
  };

  const adjustQuantity = (productId, adjustment) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.obat_id === productId) {
          const newQuantity = item.jumlah + adjustment;
          return { ...item, jumlah: newQuantity > 0 ? newQuantity : 1 };
        }
        return item;
      });
    });
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.harga_satuan) * item.jumlah), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  // Handle payment submission
  const handlePayment = async () => {
    if (!customerName) {
      setError('Nama pelanggan harus diisi');
      return;
    }

    if (paymentAmount < total) {
      setError('Jumlah pembayaran kurang');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        customer_name: customerName,
        items: cart.map(item => ({
          obat_id: item.obat_id,
          jumlah: item.jumlah
        })),
        total_harga: total,
        payment_amount: paymentAmount
      };

      const response = await api.post('/kasir/transaksi', transactionData);
      
      // Print receipt (simulated)
      printReceipt(response.data.id);
      
      // Reset after successful transaction
      setCart([]);
      setCustomerName('');
      setPaymentAmount(0);
      setOpenPaymentDialog(false);
      setSuccess('Transaksi berhasil');
      fetchTransactions();
    } catch (err) {
      setError(err.response?.data?.msg || 'Gagal memproses transaksi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Receipt printing (simulated)
  const printReceipt = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId) || {
      id: transactionId,
      tanggal: new Date().toISOString(),
      total_harga: total,
      items: cart
    };

    console.log('=== STRUK PEMBAYARAN ===');
    console.log('No. Transaksi:', transaction.id);
    console.log('Tanggal:', new Date(transaction.tanggal).toLocaleString());
    console.log('Nama Pelanggan:', customerName);
    console.log('----------------------------');
    console.log('Item:');
    transaction.items.forEach(item => {
      console.log(`${item.jumlah}x ${item.nama} @ ${formatCurrency(item.harga_satuan)}`);
    });
    console.log('----------------------------');
    console.log('Subtotal:', formatCurrency(subtotal));
    console.log('Pajak (10%):', formatCurrency(tax));
    console.log('Total:', formatCurrency(total));
    console.log('Tunai:', formatCurrency(paymentAmount));
    console.log('Kembali:', formatCurrency(paymentAmount - total));
    console.log('=== TERIMA KASIH ===');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Error/Success Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Product List Column */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">Daftar Produk</Typography>
              <Button 
                variant="outlined" 
                startIcon={<HistoryIcon />}
                onClick={() => setOpenHistoryDialog(true)}
              >
                Riwayat Transaksi
              </Button>
            </Box>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Produk</TableCell>
                    <TableCell>Harga</TableCell>
                    <TableCell>Stok</TableCell>
                    <TableCell>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.nama}</TableCell>
                      <TableCell>{formatCurrency(product.harga_satuan)}</TableCell>
                      <TableCell>{product.stok}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => addToCart(product)}
                          disabled={product.stok <= 0}
                        >
                          Tambah
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Cart Column */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShoppingCartIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Keranjang</Typography>
              <Badge
                badgeContent={cart.reduce((sum, item) => sum + item.jumlah, 0)}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>

            {cart.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                Keranjang kosong
              </Typography>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.obat_id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => adjustQuantity(item.obat_id, -1)}
                              >
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography sx={{ mx: 1 }}>{item.jumlah}</Typography>
                              <IconButton
                                size="small"
                                onClick={() => adjustQuantity(item.obat_id, 1)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>{item.nama}</TableCell>
                          <TableCell>
                            {formatCurrency(item.harga_satuan * item.jumlah)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => removeFromCart(item.obat_id)}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Pajak (10%):</Typography>
                    <Typography>{formatCurrency(tax)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle1">Total:</Typography>
                    <Typography variant="subtitle1">
                      <Chip
                        label={formatCurrency(total)}
                        color="primary"
                        size="small"
                      />
                    </Typography>
                  </Box>

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<PaidIcon />}
                    onClick={() => setOpenPaymentDialog(true)}
                    disabled={cart.length === 0 || loading}
                  >
                    Proses Pembayaran
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)}>
        <DialogTitle>Pembayaran</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nama Pelanggan"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            margin="normal"
            required
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
            Total: {formatCurrency(total)}
          </Typography>
          <TextField
            fullWidth
            label="Jumlah Pembayaran"
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
            margin="normal"
            inputProps={{ min: total }}
            required
          />
          {paymentAmount > 0 && (
            <Typography sx={{ mt: 1 }}>
              Kembalian: {formatCurrency(paymentAmount - total)}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handlePayment}
            variant="contained"
            disabled={paymentAmount < total || !customerName || loading}
            startIcon={<PrintIcon />}
          >
            {loading ? 'Memproses...' : 'Cetak Struk & Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog 
        open={openHistoryDialog} 
        onClose={() => setOpenHistoryDialog(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Riwayat Transaksi</DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Transaksi</TableCell>
                  <TableCell>Tanggal</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Detail</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.id}</TableCell>
                    <TableCell>
                      {new Date(transaction.tanggal).toLocaleString()}
                    </TableCell>
                    <TableCell>{formatCurrency(transaction.total_harga)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => {
                          console.log('Detail transaksi:', transaction);
                          alert(`Detail transaksi akan ditampilkan di sini\nID: ${transaction.id}`);
                        }}
                      >
                        Lihat
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KasirTransaksi;