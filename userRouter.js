const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('./db'); // Sesuaikan dengan modul database yang Anda gunakan

const saltRounds = 10;
const router = express.Router();

// Registrasi pengguna baru
router.post('/register', [
  body('username').isLength({ min: 5 }).withMessage('Username harus memiliki panjang minimal 5 karakter')
    .isAlphanumeric().withMessage('Username hanya boleh berisi huruf dan angka'),
  body('password').isLength({ min: 8 }).withMessage('Password harus memiliki panjang minimal 8 karakter')
    .matches(/\d/).withMessage('Password harus mengandung setidaknya satu angka')
    .matches(/[A-Z]/).withMessage('Password harus mengandung setidaknya satu huruf kapital')
    .matches(/[a-z]/).withMessage('Password harus mengandung setidaknya satu huruf kecil')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password harus mengandung setidaknya satu karakter khusus'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('no_telp').isMobilePhone().withMessage('Nomor telepon tidak valid')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(error => ({ msg: error.msg })) });
  }

  const { username, password, email, no_telp } = req.body;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan saat mengenkripsi password' });
    }

    const sql = "INSERT INTO users (username, password, email, no_telp, role) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [username, hash, email, no_telp, 'user'], (err, result) => {
      if (err) {
        console.error('Error saving user:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat menyimpan data pengguna' });
      }
      res.status(200).json({ 
        message: 'Pendaftaran pengguna berhasil',
        role: 'user'
      });
    });
  });
});

// Login pengguna
router.post('/login', [
  body('username').isAlphanumeric().withMessage('Username hanya boleh berisi huruf dan angka'),
  body('password').isLength({ min: 8 }).withMessage('Password harus memiliki panjang minimal 8 karakter')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map(error => ({ msg: error.msg })) });
  }

  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error('Error querying user:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan saat mencari pengguna' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Pengguna tidak ditemukan' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error('Error comparing password:', err);
        return res.status(500).json({ error: 'Terjadi kesalahan saat memverifikasi password' });
      }
      if (!match) {
        return res.status(401).json({ error: 'Password salah' });
      }
      res.status(200).json({ 
        message: 'Login berhasil',
        role: user.role,
        user_id: user.id
      });
    });
  });
});

// Endpoint untuk mengambil data pengguna berdasarkan ID


module.exports = router;
