const express = require('express');
const { getAllUsers, getUserById } = require('../services/userService');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(getAllUsers());
});

router.get('/:id', (req, res) => {
  const user = getUserById(req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
});

module.exports = router;
