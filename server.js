require('dotenv').config({ quiet: true });

const express = require('express');
const authenticateToken = require('./middleware/auth');
const usersRouter = require('./routes/users');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get('/', (req, res) => {
  res.send('Hello from CodeBox!');
});

app.use('/api/users', usersRouter);

app.get('/api/me', authenticateToken, (req, res) => {
  res.json({ id: 1, name: 'Alex' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CodeBox server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
