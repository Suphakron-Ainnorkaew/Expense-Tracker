const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rates] = await db.query('SELECT * FROM exchange_rates');
    console.log('Fetched rates:', rates); // Debug
    res.json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;