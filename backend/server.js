const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const fs = require('fs');

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public', 'build')));

// Routes
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const currencyRoutes = require('./routes/currency');
const investorRoutes = require('./routes/investor');
const usersRouter = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/currency', currencyRoutes);
app.use('/api/investor', investorRoutes);
app.use('/api/users', usersRouter);


app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'build', 'index.html');
    console.log('Looking for file at:', filePath); // พิมพ์ Path ออกมา
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send('File not found at ' + filePath);
    }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});