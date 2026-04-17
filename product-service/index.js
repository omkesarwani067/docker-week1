const express = require('express');
const { log } = require('./logger');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const SERVICE = 'product-service';

const products = [
  { id: 1, name: 'Laptop Pro', price: 1299, stock: 45 },
  { id: 2, name: 'Wireless Mouse', price: 29, stock: 200 },
  { id: 3, name: 'Mechanical Keyboard', price: 89, stock: 78 },
];

app.get('/health', async (req, res) => {
  await log(SERVICE, 'INFO', 'Health check called');
  res.json({ status: 'ok', service: SERVICE, uptime: process.uptime() });
});

app.get('/products', async (req, res) => {
  await log(SERVICE, 'INFO', 'Product list fetched', { count: products.length });
  res.json({ products, total: products.length });
});

app.get('/products/:id', async (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) {
    await log(SERVICE, 'WARN', 'Product not found', { productId: req.params.id });
    return res.status(404).json({ error: 'Product not found' });
  }
  await log(SERVICE, 'INFO', 'Product fetched', { productId: product.id, name: product.name });
  res.json(product);
});

app.listen(PORT, () => {
  console.log(`[${SERVICE}] Running on port ${PORT}`);
  log(SERVICE, 'INFO', `${SERVICE} started on port ${PORT}`);
});
