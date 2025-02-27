/******************************************************/
/*** server.js -- Node/Express for 99x Cafe POS    ****/
/******************************************************/
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
/*** In-memory data store ***************************/
/****************************************************/
let categories = [];
let items = [];
let seats = [];
let cashiers = [];
let bookings = [];
let orders = [];  // <-- NEW for Orders

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
  res.json(categories);
});
app.post('/api/categories', (req, res) => {
  const { name } = req.body;
  if(!name) return res.status(400).json({error:'Category name is required.'});
  
  const newCat = { id: Date.now(), name };
  categories.push(newCat);
  res.json(newCat);
});
app.put('/api/categories/:id', (req, res) => {
  const cat = findById(categories, req.params.id);
  if(!cat) return res.status(404).json({error:'Category not found.'});
  
  const { name } = req.body;
  if(!name) return res.status(400).json({error:'Category name is required.'});
  
  cat.name = name;
  res.json(cat);
});
app.delete('/api/categories/:id', (req, res) => {
  const idx = categories.findIndex(c => c.id === parseInt(req.params.id));
  if(idx===-1) return res.status(404).json({error:'Category not found.'});
  
  const removed = categories.splice(idx,1)[0];
  res.json(removed);
});

/****************************************************/
/*******************   Items API   ******************/
/****************************************************/
app.get('/api/items', (req, res) => {
  res.json(items);
});
app.post('/api/items', (req, res) => {
  const { name, price, categoryId } = req.body;
  if(!name || price==null || !categoryId) {
    return res.status(400).json({error:'name, price, and categoryId required.'});
  }
  const cat = findById(categories, categoryId);
  if(!cat) return res.status(400).json({error:'Invalid categoryId.'});
  
  const newItem = {
    id: Date.now(),
    name,
    price: parseFloat(price),
    categoryId: parseInt(categoryId)
  };
  items.push(newItem);
  res.json(newItem);
});
app.put('/api/items/:id', (req, res) => {
  const item = findById(items, req.params.id);
  if(!item) return res.status(404).json({error:'Item not found.'});
  
  const { name, price, categoryId } = req.body;
  if(!name || price==null || !categoryId) {
    return res.status(400).json({error:'name, price, categoryId required.'});
  }
  const cat = findById(categories, categoryId);
  if(!cat) return res.status(400).json({error:'Invalid categoryId.'});
  
  item.name = name;
  item.price = parseFloat(price);
  item.categoryId = parseInt(categoryId);
  res.json(item);
});
app.delete('/api/items/:id', (req, res) => {
  const idx = items.findIndex(i => i.id===parseInt(req.params.id));
  if(idx===-1) return res.status(404).json({error:'Item not found.'});
  
  const removed = items.splice(idx,1)[0];
  res.json(removed);
});

/****************************************************/
/*******************   Seats API   ******************/
/****************************************************/
app.get('/api/seats', (req, res) => {
  res.json(seats);
});
app.post('/api/seats', (req, res) => {
  const { name } = req.body;
  if(!name) return res.status(400).json({error:'Seat name is required.'});
  
  const newSeat = { id: Date.now(), name, isReserved:false };
  seats.push(newSeat);
  res.json(newSeat);
});
app.put('/api/seats/:id', (req, res) => {
  const seat = findById(seats, req.params.id);
  if(!seat) return res.status(404).json({error:'Seat not found.'});
  
  const { name, isReserved } = req.body;
  if(name!==undefined) seat.name = name;
  if(isReserved!==undefined) seat.isReserved = !!isReserved;
  res.json(seat);
});
app.delete('/api/seats/:id', (req, res) => {
  const idx = seats.findIndex(s => s.id===parseInt(req.params.id));
  if(idx===-1) return res.status(404).json({error:'Seat not found.'});
  
  const removed = seats.splice(idx,1)[0];
  res.json(removed);
});

/****************************************************/
/******************  Cashiers API  ******************/
/****************************************************/
app.get('/api/cashiers', (req, res) => {
  res.json(cashiers);
});
app.post('/api/cashiers', (req, res) => {
  const { name } = req.body;
  if(!name) return res.status(400).json({error:'Cashier name is required.'});
  
  const newCashier = { id: Date.now(), name };
  cashiers.push(newCashier);
  res.json(newCashier);
});
app.put('/api/cashiers/:id', (req, res) => {
  const c = findById(cashiers, req.params.id);
  if(!c) return res.status(404).json({error:'Cashier not found.'});
  
  const { name } = req.body;
  if(!name) return res.status(400).json({error:'Cashier name is required.'});
  
  c.name = name;
  res.json(c);
});
app.delete('/api/cashiers/:id', (req, res) => {
  const idx = cashiers.findIndex(x => x.id===parseInt(req.params.id));
  if(idx===-1) return res.status(404).json({error:'Cashier not found.'});
  
  const removed = cashiers.splice(idx,1)[0];
  res.json(removed);
});

/****************************************************/
/******************  Bookings API  ******************/
/****************************************************/
app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});
app.post('/api/bookings', (req, res) => {
  const { name, date, seatCount } = req.body;
  if(!name || !date || seatCount==null) {
    return res.status(400).json({error:'name, date, seatCount required.'});
  }
  // check seat availability
  const available = seats.filter(s => !s.isReserved);
  if(available.length<seatCount) {
    return res.status(400).json({error:`Not enough seats. Only ${available.length} available.`});
  }
  // reserve
  const seatsToReserve = available.slice(0, seatCount);
  seatsToReserve.forEach(s => s.isReserved=true);
  
  const newBooking = {
    id: Date.now(),
    name, 
    date, 
    seatCount,
    reservedSeats: seatsToReserve.map(x=>x.id)
  };
  bookings.push(newBooking);
  res.json(newBooking);
});
app.put('/api/bookings/:id', (req, res) => {
  const booking = findById(bookings, req.params.id);
  if(!booking) return res.status(404).json({error:'Booking not found.'});
  
  const { name, date, seatCount } = req.body;
  if(!name || !date || seatCount==null) {
    return res.status(400).json({error:'name, date, seatCount required.'});
  }
  // unreserve old seats
  booking.reservedSeats.forEach(seatId => {
    const seatObj = findById(seats, seatId);
    if(seatObj) seatObj.isReserved=false;
  });
  booking.reservedSeats=[];
  
  // check seat availability
  const available = seats.filter(s=>!s.isReserved);
  if(available.length<seatCount) {
    return res.status(400).json({error:`Not enough seats. Only ${available.length} available.`});
  }
  // reserve new
  const seatsToReserve = available.slice(0, seatCount);
  seatsToReserve.forEach(s=>s.isReserved=true);
  
  booking.name=name;
  booking.date=date;
  booking.seatCount=seatCount;
  booking.reservedSeats=seatsToReserve.map(x=>x.id);
  res.json(booking);
});
app.delete('/api/bookings/:id', (req, res) => {
  const idx = bookings.findIndex(b => b.id===parseInt(req.params.id));
  if(idx===-1) return res.status(404).json({error:'Booking not found.'});
  
  // unreserve seats
  bookings[idx].reservedSeats.forEach(sid=>{
    const st = findById(seats, sid);
    if(st) st.isReserved=false;
  });
  const removed = bookings.splice(idx,1)[0];
  res.json(removed);
});

/****************************************************/
/*******************  Orders API  *******************/
/****************************************************/
// The 'orders' array will hold objects like:
// {
//   id: number,
//   seatId: number (or null if not assigned),
//   lines: [ { itemId, itemName, price, quantity, lineTotal }, ... ],
//   total: number
// }

// GET all orders
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// POST create a new order
app.post('/api/orders', (req, res) => {
  // Expect seatId (optional), lines array with itemId + quantity
  const { seatId, lines } = req.body;
  if(!lines || !Array.isArray(lines) || lines.length===0) {
    return res.status(400).json({error:'Order lines required.'});
  }

  // Build lines with full details
  let total=0;
  const processedLines = lines.map(ln=>{
    const item = findById(items, ln.itemId);
    if(!item) {
      throw new Error(`Invalid itemId: ${ln.itemId}`);
    }
    const quantity = parseInt(ln.quantity) || 1;
    const lineTotal = item.price*quantity;
    total+=lineTotal;

    return {
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      quantity,
      lineTotal
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

// PUT update an order (e.g. to modify lines or seat)
app.put('/api/orders/:id', (req, res) => {
  const order = findById(orders, req.params.id);
  if(!order) return res.status(404).json({error:'Order not found.'});
  
  const { seatId, lines } = req.body;
  if(!lines || !Array.isArray(lines) || lines.length===0) {
    return res.status(400).json({error:'Order lines required.'});
  }

  // Recalculate lines
  let total=0;
  const processedLines = lines.map(ln=>{
    const item = findById(items, ln.itemId);
    if(!item) {
      throw new Error(`Invalid itemId: ${ln.itemId}`);
    }
    const quantity = parseInt(ln.quantity) || 1;
    const lineTotal = item.price*quantity;
    total+=lineTotal;
    return {
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      quantity,
      lineTotal
    };
  });

  order.seatId = seatId ? parseInt(seatId) : null;
  order.lines = processedLines;
  order.total = parseFloat(total.toFixed(2));

  res.json(order);
});

// DELETE an order
app.delete('/api/orders/:id', (req, res) => {
  const idx = orders.findIndex(o => o.id===parseInt(req.params.id));
  if(idx===-1) return res.status(404).json({error:'Order not found.'});
  
  const removed = orders.splice(idx,1)[0];
  res.json(removed);
});

/****************************************************/
/*************** Example Seed Data ******************/
/****************************************************/
function seedData() {
  categories.push({ id: 1, name:'Beverages' });
  categories.push({ id: 2, name:'Desserts' });

  items.push({ id:101, name:'Latte', price:4.99, categoryId:1 });
  items.push({ id:102, name:'Chocolate Cake', price:5.99, categoryId:2 });
  
  seats.push({id:201, name:'Table 1', isReserved:false});
  seats.push({id:202, name:'Table 2', isReserved:true});
  
  cashiers.push({id:301, name:'Alice'});
  cashiers.push({id:302, name:'Bob'});
}

seedData();

/****************************************************/
/************** Start the server ********************/
/****************************************************/
app.listen(PORT, () => {
  console.log(`99X Cafe POS running at http://localhost:${PORT}`);
  console.log(`- Root: http://localhost:${PORT}/index.html`);
  console.log(`- Management: http://localhost:${PORT}/app/index.html`);
});
