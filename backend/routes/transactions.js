const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all transactions
router.get('/', async (req, res) => {
  try {
    console.log('GET /api/transactions - Query:', req.query);
    const [rows] = await db.query('SELECT * FROM transactions WHERE user_id = ?', [req.query.userId]);
    console.log('Transactions fetched:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add transaction
router.post('/', async (req, res) => {
  const { user_id, type, category, amount, currency, description, date } = req.body;
  try {
    console.log('POST /api/transactions - Body:', req.body);
    const [result] = await db.query(
      'INSERT INTO transactions (user_id, type, category, amount, currency, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, type, category, amount, currency, description, date]
    );
    console.log('Transaction added with ID:', result.insertId);
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Convert currency
router.post('/convert', async (req, res) => {
  const { transactionId, newCurrency } = req.body;
  try {
    console.log('POST /api/transactions/convert - Body:', req.body);
    if (!transactionId || !newCurrency) {
      return res.status(400).json({ error: 'Missing transactionId or newCurrency' });
    }
    const [rates] = await db.query('SELECT * FROM exchange_rates');
    if (!rates || rates.length === 0) {
      return res.status(500).json({ error: 'No exchange rates found in database' });
    }
    const [transaction] = await db.query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    if (!transaction || transaction.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    const oldRate = rates.find(r => r.currency_code === transaction[0].currency)?.rate_to_thb;
    const newRate = rates.find(r => r.currency_code === newCurrency)?.rate_to_thb;
    if (!oldRate || !newRate) {
      return res.status(400).json({ error: 'Unsupported currency' });
    }
    const newAmount = (transaction[0].amount * oldRate) / newRate;
    await db.query('UPDATE transactions SET amount = ?, currency = ? WHERE id = ?', [newAmount, newCurrency, transactionId]);
    console.log('Currency converted for transaction ID:', transactionId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/transactions/convert:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add savings goal
router.post('/savings-goals', async (req, res) => {
  const { user_id, amount, months, description } = req.body;
  try {
    console.log('POST /api/transactions/savings-goals - Body:', req.body);
    const [result] = await db.query(
      'INSERT INTO savings_goals (user_id, amount, months, description) VALUES (?, ?, ?, ?)',
      [user_id, amount, months, description]
    );
    console.log('Savings goal added with ID:', result.insertId);
    res.json({ id: result.insertId });
  } catch (error) {
    console.error('Error in POST /api/transactions/savings-goals:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all savings goals
router.get('/savings-goals', async (req, res) => {
  try {
    console.log('GET /api/transactions/savings-goals - Query:', req.query);
    const [rows] = await db.query('SELECT * FROM savings_goals WHERE user_id = ?', [req.query.userId]);
    console.log('Savings goals fetched:', rows);
    res.json(rows);
  } catch (error) {
    console.error('Error in GET /api/transactions/savings-goals:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simulate expense
router.post('/simulate', async (req, res) => {
  const { user_id, newExpense } = req.body;
  try {
    console.log('POST /api/transactions/simulate - Body:', req.body);
    const [summary] = await db.query(
      'SELECT SUM(CASE WHEN type = "income" THEN amount ELSE 0 END) as income, SUM(CASE WHEN type = "expense" THEN amount ELSE 0 END) as expense FROM transactions WHERE user_id = ?',
      [user_id]
    );
    const currentBalance = (summary[0].income || 0) - (summary[0].expense || 0);
    const simulatedBalance = currentBalance - (parseFloat(newExpense) || 0);

    res.json({
      currentBalance,
      simulatedBalance,
      alert: simulatedBalance < 0 || (summary[0].expense + parseFloat(newExpense)) > summary[0].income
    });
  } catch (error) {
    console.error('Error in POST /api/transactions/simulate:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;