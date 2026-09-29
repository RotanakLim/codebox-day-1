require('dotenv').config({ quiet: true });

const express = require('express');
const usersRouter = require('./routes/users');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.get('/', (req, res) => {
  res.send('Hello from CodeBox!');
});

app.use('/api/users', usersRouter);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CodeBox server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
