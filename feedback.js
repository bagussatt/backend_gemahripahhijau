const express = require('express');
const router = express.Router();
const db = require('./db');

// Endpoint to submit feedback
router.post('/create', (req, res) => {
  const { user_id, pickup_id, feedback, rating } = req.body;
  const query = 'INSERT INTO feedback (user_id, pickup_id, feedback, rating) VALUES (?, ?, ?, ?)';

  db.query(query, [user_id, pickup_id, feedback, rating], (err, result) => {
    if (err) {
      console.error('Error inserting feedback:', err);
      return res.status(500).send({ message: 'Failed to submit feedback' });
    }
    res.status(200).send({ message: 'Feedback submitted successfully' });
  });
});

// Endpoint to get feedback by user ID
router.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  const query = 'SELECT * FROM feedback WHERE user_id = ?';

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error getting feedback:', err);
      return res.status(500).send({ message: 'Failed to get feedback' });
    }
    res.status(200).json(results);
  });
});

//read Admi
router.get('/read', (req, res) => {
  const { user_id } = req.params;
  const query = 'SELECT * FROM feedback';

  db.query(query, [user_id], (err, results) => {
    if (err) {
      console.error('Error getting feedback:', err);
      return res.status(500).send({ message: 'Failed to get feedback' });
    }
    res.status(200).json(results);
  });
});

module.exports = router;
