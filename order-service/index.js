const express = require('express');
const { log } = require('./logger');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;
const SERVICE = 'order-service';
const orders = [];

app.get('/health', async (req, res) => {
  await log(SERVICE, 'INFO', 'Health check called');
  res.json({ status: 'ok', service: SERVICE, uptime: process.uptime() });
});

app.get('/orders', async (req, res) => {
  await log(SERVICE, 'INFO', 'Orders list fetched', { count: orders.length });
  res.json({ orders, total: orders.length });
});

app.post('/orders', async (req, res) => {
  const { productId, quantity, userId } = req.body;
  if (!productId || !quantity || !userId) {
    await log(SERVICE, 'WARN', 'Order creation failed - missing fields', { body: req.body });
    return res.status(400).json({ error: 'Missing productId, quantity, or userId' });
  }
  const order = {
    id: orders.length + 1,
    productId, quantity, userId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  await log(SERVICE, 'INFO', 'Order created successfully', { orderId: order.id, userId, productId });
  res.status(201).json(order);
});

// Simulate random errors for anomaly detection testing later
app.get('/simulate-error', async (req, res) => {
  await log(SERVICE, 'ERROR', 'Simulated database connection failure', {
    error: 'ECONNREFUSED',
    host: 'postgres',
    port: 5432
  });
  res.status(500).json({ error: 'Simulated error logged' });
});

app.listen(PORT, () => {
  console.log(`[${SERVICE}] Running on port ${PORT}`);
  log(SERVICE, 'INFO', `${SERVICE} started on port ${PORT}`);
});
