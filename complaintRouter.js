const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage
}).single('image');

// Create - Upload image
router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const imageUrl = `http://10.0.2.2:3000/uploads/${req.file.filename}`; // Ganti dengan IP server Anda
      const { user_id, complaint } = req.body; // Ambil user_id dan complaint dari body request
      const photo_url = imageUrl; // Gunakan imageUrl yang sudah diambil dari upload

      const sql = "INSERT INTO complaints (user_id, complaint, photo_url) VALUES (?, ?, ?)";
      db.query(sql, [user_id, complaint, photo_url], (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json({ id: result.insertId, photo_url: photo_url });
        }
      });
    }
  });
});

// Read - Get complaints for a specific user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const sql = "SELECT * FROM complaints WHERE user_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// Get all complaints (for admin)
router.get('/images', (req, res) => {
  const sql = "SELECT * FROM complaints";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(results);
    }
  });
});

// Update - Update complaint and/or image
router.put('/images/:id', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const { id } = req.params;
    const { complaint } = req.body;
    let updateFields = [];
    let updateValues = [];
    
    if (complaint) {
      updateFields.push('complaint = ?');
      updateValues.push(complaint);
    }
    
    if (req.file) {
      const imageUrl = `http://10.0.2.2:3000/uploads/${req.file.filename}`;
      updateFields.push('photo_url = ?');
      updateValues.push(imageUrl);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    
    updateValues.push(id); // push id to updateValues array for WHERE clause
    
    const sql = `UPDATE complaints SET ${updateFields.join(', ')} WHERE id = ?`;
    
    db.query(sql, updateValues, (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ message: 'Complaint updated successfully' });
      }
    });
  });
});


// Delete - Delete image
router.delete('/images/:id', (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM complaints WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Complaint deleted successfully' });
    }
  });
});

module.exports = router;
