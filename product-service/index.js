const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const SERVICE = 'product-service';

const products = [
  { id: 1, name: 'Laptop Pro', price: 1299, stock: 45 },
  { id: 2, name: 'Wireless Mouse', price: 29, stock: 200 },
  { id: 3, name: 'Mechanical Keyboard', price: 89, stock: 78 },
];

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: SERVICE, uptime: process.uptime() });
});

app.get('/products', (req, res) => {
  res.json({ products, total: products.length });
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === Number(req.params.id));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

app.listen(PORT, () => console.log(`[${SERVICE}] Running on port ${PORT}`));
