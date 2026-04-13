const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const SERVICE = 'auth-service';

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: SERVICE, uptime: process.uptime() });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Missing credentials' });
  res.json({ token: `token-${Date.now()}`, user: username });
});

app.get('/verify', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'No token' });
  res.json({ valid: true, token });
});

app.listen(PORT, () => console.log(`[${SERVICE}] Running on port ${PORT}`));
