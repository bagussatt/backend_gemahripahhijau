const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const db = require('./db');

// Import semua router yang sudah dibuat
const userRouter = require('./userRouter');
const pickupRouter = require('./pickupsRouter');
const feedbackRouter = require('./feedback');
const complaintRouter = require('./complaintRouter');

const app = express();
app.use(bodyParser.json());

// Serve static files from 'uploads' folder
app.use('/uploads', express.static('uploads'));

// Middleware untuk menghandle CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Gunakan router yang sudah diimpor
app.use('/users', userRouter);
app.use('/pickups', pickupRouter);
app.use('/feedback', feedbackRouter);
app.use('/complaints', complaintRouter);

app.get('/user/:nama', async (req, res) => {
  try {
    const { username } = req.params;
    const sql = "SELECT * FROM users WHERE username = ?";
    const [results] = await db.query(sql, [username]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    }

    res.status(200).json(results[0]);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data pengguna' });
  }
});

app.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sql = 'SELECT * FROM users WHERE id = ?';
    const [results] = await db.query(sql, [id]);
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(results[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving user' });
  }
});

// Listen on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
