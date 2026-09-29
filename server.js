const express = require('express');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const users = [
  { id: 1, name: 'Alex' },
  { id: 2, name: 'Sam' }
];

app.get('/', (req, res) => {
  res.send('Hello from CodeBox!');
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(({ id }) => id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`CodeBox server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
