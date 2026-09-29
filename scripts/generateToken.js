require('dotenv').config({ quiet: true });

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Set it in the local .env file before generating a token.');
}

const token = jwt.sign(
  { id: 1 },
  JWT_SECRET,
  { algorithm: 'HS256', expiresIn: '15m' }
);

console.log(token);
