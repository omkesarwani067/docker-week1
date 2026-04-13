const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;
const SERVICE = 'order-service';

const orders = [];

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: SERVICE, uptime: process.uptime() });
});

app.get('/orders', (req, res) => {
  res.json({ orders, total: orders.length });
});

app.post('/orders', (req, res) => {
  const { productId, quantity, userId } = req.body;
  if (!productId || !quantity || !userId)
    return res.status(400).json({ error: 'Missing productId, quantity, or userId' });
  const order = {
    id: orders.length + 1,
    productId, quantity, userId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  res.status(201).json(order);
});

app.listen(PORT, () => console.log(`[${SERVICE}] Running on port ${PORT}`));
