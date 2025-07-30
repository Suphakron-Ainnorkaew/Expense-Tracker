// Migration/patch: Add endpoint for completing a savings goal and deducting from investment
const express = require('express');
const router = require('../routes/transactions');
const db = require('../config/db');

// Add this to routes/transactions.js (or merge manually)
router.post('/savings-goals/:id/complete', async (req, res) => {
  // Expect: user_id in body (for security), or fetch from session if you use auth
  const { user_id } = req.body;
  const goalId = req.params.id;
  try {
    // 1. Get the savings goal
    const [goals] = await db.query('SELECT * FROM savings_goals WHERE id = ? AND user_id = ?', [goalId, user_id]);
    if (!goals.length) return res.status(404).json({ error: 'Savings goal not found' });
    const goal = goals[0];
    // 2. Insert a transaction: type = 'investor', amount = -goal.amount (withdraw)
    await db.query(
      'INSERT INTO transactions (user_id, type, category, amount, currency, description, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, 'investor', 'ถอนเงินออม', -goal.amount, 'THB', `ถอนเงินจากเป้าหมาย: ${goal.description || ''}`, new Date()]
    );
    // 3. Optionally, mark the goal as completed (add a column if needed)
    await db.query('DELETE FROM savings_goals WHERE id = ?', [goalId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export for patching
module.exports = router;
