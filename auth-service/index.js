const express = require('express');
const { log } = require('./logger');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SERVICE = 'auth-service';

app.get('/health', async (req, res) => {
  await log(SERVICE, 'INFO', 'Health check called');
  res.json({ status: 'ok', service: SERVICE, uptime: process.uptime() });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    await log(SERVICE, 'WARN', 'Login attempt with missing credentials', { ip: req.ip });
    return res.status(400).json({ error: 'Missing credentials' });
  }
  await log(SERVICE, 'INFO', 'User logged in successfully', { username });
  res.json({ token: `token-${Date.now()}`, user: username });
});

app.get('/verify', async (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    await log(SERVICE, 'WARN', 'Token verification failed - no token provided');
    return res.status(401).json({ error: 'No token' });
  }
  await log(SERVICE, 'INFO', 'Token verified successfully');
  res.json({ valid: true, token });
});

app.listen(PORT, () => {
  console.log(`[${SERVICE}] Running on port ${PORT}`);
  log(SERVICE, 'INFO', `${SERVICE} started on port ${PORT}`);
});
