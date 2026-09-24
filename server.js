const express = require('express');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hello from CodeBox!');
});

app.listen(PORT, () => {
  console.log(`CodeBox server listening on http://localhost:${PORT}`);
});
