const express = require('express');
const router = express.Router();

router.get('/crypto', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=thb,usd'
    );
    const data = await response.json();
    res.json(data.bitcoin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;