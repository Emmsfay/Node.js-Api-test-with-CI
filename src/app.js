const express = require('express');

function createApp() {
  const app = express();
  app.use(express.json());

  const items = [
    { id: 1, name: 'Keyboard', price: 49.99, stock: 10 },
    { id: 2, name: 'Mouse', price: 19.99, stock: 5 },
  ];

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.get('/items', (req, res) => res.json(items));

  app.post('/orders', (req, res) => {
    const { itemId, quantity } = req.body;
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ error: 'quantity must be a positive integer' });
    }
    const item = items.find((i) => i.id === itemId);
    if (!item) return res.status(404).json({ error: 'item not found' });
    if (quantity > item.stock) {
      return res.status(409).json({ error: 'insufficient stock' });
    }
    const total = Math.round(item.price * quantity * 100) / 100;
    return res.status(201).json({ itemId, quantity, total });
  });

  return app;
}

module.exports = { createApp };