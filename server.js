const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('./db');
const userRouter = require('./userRouter'); // Import userRouter
const complaintRouter = require('./complaintRouter'); // Import complaintRouter
const pickupsRouter = require('./pickupsRouter'); 

const app = express();
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve static files from 'uploads' folder

// Use userRouter
app.use('/users', userRouter);

// Use complaintRouter
app.use('/complaints', complaintRouter);
app.use('/pickups', pickupsRouter);
// Jumlah salt rounds untuk bcrypt
const saltRounds = 10;

// Registrasi pengguna baru
app.post('/register', [
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
      return res.status(500).json({ error: 'Terjadi kesalahan saat mengenkripsi password' });
    }

    const sql = "INSERT INTO users (username, password, email, no_telp, role) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [username, hash, email, no_telp, 'user'], (err, result) => {
      if (err) {
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
app.post('/login', [
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
      return res.status(500).json({ error: 'Terjadi kesalahan saat mencari pengguna' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Pengguna tidak ditemukan' });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
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

// Endpoint untuk mengambil data pengguna berdasarkan username
app.get('/user/:username', (req, res) => {
  const { username } = req.params;

  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pengguna' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    res.status(200).json(results[0]);
  });
});

// Listen on port 3000
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
