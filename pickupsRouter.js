const express = require('express');
const router = express.Router();
const db = require('./db'); // Sesuaikan dengan modul database yang Anda gunakan

// Endpoint untuk menambahkan penjemputan sampah baru
router.post('/create', (req, res) => {
    const { user_id, waktu, lokasi, catatan } = req.body;

    // Validasi input
    if (!user_id || !waktu || !lokasi) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }
    
    const sql = "INSERT INTO pickups (user_id, waktu, lokasi) VALUES (?, ?, ?)";
    db.query(sql, [user_id, waktu, lokasi], (err, result) => {
        if (err) {
            console.error('Error creating pickup:', err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan data penjemputan sampah' });
        }
        res.status(200).json({ message: 'Penjemputan sampah berhasil ditambahkan' });
    });
});

// Endpoint untuk mengambil semua penjemputan sampah
router.get('/read', (req, res) => {
    const sql = "SELECT * FROM pickups";
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching pickups:', err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data penjemputan sampah' });
        }
        res.status(200).json(results);
    });
});

// Endpoint untuk mengambil penjemputan sampah berdasarkan ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = "SELECT * FROM pickups WHERE id = ?";
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching pickup by ID:', err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data penjemputan sampah' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Penjemputan sampah tidak ditemukan' });
        }
        res.status(200).json(results[0]);
    });
});

// Endpoint untuk menghapus penjemputan sampah berdasarkan ID
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = "DELETE FROM pickups WHERE id = ?";
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting pickup:', err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat menghapus data penjemputan sampah' });
        }
        res.status(200).json({ message: 'Penjemputan sampah berhasil dihapus' });
    });
});

// Endpoint untuk mengupdate penjemputan sampah berdasarkan ID
router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { status, catatan } = req.body;

    // Validasi input
    if (!status || !catatan) {
        return res.status(400).json({ error: 'Status dan catatan harus diisi' });
    }

    // Validasi status harus enum 'In Process' atau 'Collected'
    if (status !== 'In Process' && status !== 'Collected') {
        return res.status(400).json({ error: 'Status harus berupa "In Process" atau "Collected"' });
    }

    const sql = "UPDATE pickups SET status = ?, catatan = ? WHERE id = ?";
    db.query(sql, [status, catatan, id], (err, result) => {
        if (err) {
            console.error('Error updating pickup:', err);
            return res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate data penjemputan sampah' });
        }
        res.status(200).json({ message: 'Penjemputan sampah berhasil diupdate' });
    });
});

module.exports = router;
