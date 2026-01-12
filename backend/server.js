require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { pool } = require('./db');
const categoryRoutes = require('./routes/categoryRoutes'); // ✅ ADD
const subcategoryRoutes = require('./routes/subcategoryRoutes'); // ✅ ADD
const productRoutes = require('./routes/productRoutes'); // ✅ ADD
const authRoutes = require('./routes/authRoutes'); // ✅ ADD
const orderRoutes = require('./routes/orderRoutes'); // ✅ ADD
const dashboardRoutes = require('./routes/dashboardRoutes'); // ✅ ADD


const app = express();

app.use(cors());

// ✅ REQUIRED for FormData (image + text)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC IMAGE ACCESS
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// TEST ROUTES (unchanged)
app.get('/', (req, res) =>
  res.json({ ok: true, message: 'Backend running' })
);

app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 as ok');
    return res.json({ connected: true, rows });
  } catch (err) {
    console.error('DB test failed', err);
    return res.status(500).json({ connected: false, error: err.message });
  }
});

// ✅ API ROUTES
app.use('/api', categoryRoutes);
app.use('/api', subcategoryRoutes); // ✅ ADD
app.use('/api', productRoutes); // ✅ ADD
app.use('/api', authRoutes); // ✅ ADD
app.use('/api', orderRoutes); // ✅ ADD
app.use('/api', dashboardRoutes); // ✅ ADD


const PORT = process.env.PORT || 5000;

// DB CHECK
async function checkDBConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  checkDBConnection();
});