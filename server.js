/******************************************************/
/*** server.js -- Node/Express for 99x Cafe POS    ****/
/******************************************************/
const db = require('./db');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve root index.html at "/", "/index.html"
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the /app folder statically
app.use('/app', express.static(path.join(__dirname, 'app')));

/****************************************************/
/*** In-memory data store (Only for Non-DB Data) ***/
/****************************************************/
let orders = []; // Orders will still be stored in memory

/****************************************************/
/*** Helper: find item by ID in an array ************/
/****************************************************/
function findById(array, id) {
  return array.find(obj => obj.id === parseInt(id));
}

/****************************************************/
/****************   Categories API   ****************/
/****************************************************/
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required.' });

  db.run('INSERT INTO categories (name) VALUES (?)', [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

/****************************************************/
/*******************   Items API   ******************/
/****************************************************/
app.get('/api/items', (req, res) => {
  db.all('SELECT * FROM items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/items', (req, res) => {
  const { name, price, categoryId } = req.body;
  if (!name || price == null || !categoryId) return res.status(400).json({ error: 'Missing fields' });

  db.run('INSERT INTO items (name, price, categoryId) VALUES (?, ?, ?)', [name, price, categoryId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, price, categoryId });
  });
});

/****************************************************/
/*******************   Seats API   ******************/
/****************************************************/
app.get('/api/seats', (req, res) => {
  db.all('SELECT * FROM seats', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/seats', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Seat name is required.' });

  db.run('INSERT INTO seats (name, isReserved) VALUES (?, ?)', [name, 0], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, isReserved: false });
  });
});

/****************************************************/
/******************  Cashiers API  ******************/
/****************************************************/
app.get('/api/cashiers', (req, res) => {
  db.all('SELECT * FROM cashiers', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/cashiers', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Cashier name is required.' });

  db.run('INSERT INTO cashiers (name) VALUES (?)', [name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name });
  });
});

/****************************************************/
/******************  Bookings API  ******************/
/****************************************************/
app.get('/api/bookings', (req, res) => {
  db.all('SELECT * FROM bookings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/bookings', (req, res) => {
  const { name, date, seatCount } = req.body;
  if (!name || !date || seatCount == null) return res.status(400).json({ error: 'All fields required.' });

  db.run('INSERT INTO bookings (name, date, seatCount) VALUES (?, ?, ?)', [name, date, seatCount], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, name, date, seatCount });
  });
});

/****************************************************/
/*******************  Orders API  *******************/
/****************************************************/
// Orders are still stored in memory for performance reasons
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', (req, res) => {
  const { seatId, lines } = req.body;
  if (!lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: 'Order lines required.' });
  }

  let total = 0;
  const processedLines = lines.map(ln => {
    total += ln.price * ln.quantity;
    return {
      itemId: ln.itemId,
      itemName: ln.itemName,
      price: ln.price,
      quantity: ln.quantity,
      lineTotal: ln.price * ln.quantity
    };
  });

  const newOrder = {
    id: Date.now(),
    seatId: seatId ? parseInt(seatId) : null,
    lines: processedLines,
    total: parseFloat(total.toFixed(2))
  };
  orders.push(newOrder);
  res.json(newOrder);
});

app.delete('/api/orders/:id', (req, res) => {
  const idx = orders.findIndex(o => o.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Order not found.' });

  const removed = orders.splice(idx, 1)[0];
  res.json(removed);
});

/****************************************************/
/************** Start the server ********************/
/****************************************************/
app.listen(PORT, () => {
  console.log(`✅ 99X Cafe POS running at http://localhost:${PORT}`);
  console.log(`🔗 Root: http://localhost:${PORT}/index.html`);
  console.log(`🔗 Management: http://localhost:${PORT}/app/index.html`);
});
/******************************************************/