const test = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/app');

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = createApp().listen(0, resolve);
  });
  base = `http://localhost:${server.address().port}`;
});

test.after(() => server.close());

async function post(path, body) {
  return fetch(base + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('GET /health returns ok', async () => {
  const res = await fetch(base + '/health');
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(await res.json(), { status: 'ok' });
});

test('POST /orders creates an order with a total', async () => {
  const res = await post('/orders', { itemId: 1, quantity: 2 });
  assert.strictEqual(res.status, 201);
  assert.strictEqual((await res.json()).total, 99.98);
});

test('POST /orders rejects unknown item', async () => {
  const res = await post('/orders', { itemId: 99, quantity: 1 });
  assert.strictEqual(res.status, 404);
});

test('POST /orders rejects insufficient stock', async () => {
  const res = await post('/orders', { itemId: 2, quantity: 50 });
  assert.strictEqual(res.status, 409);
});

test('POST /orders rejects invalid quantity', async () => {
  const res = await post('/orders', { itemId: 1, quantity: 0 });
  assert.strictEqual(res.status, 400);
});