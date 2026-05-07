require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDatabase, createTables, migrateColumns } = require('./db');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const salesRoutes = require('./routes/sales');
const logsRoutes = require('./routes/logs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();
createTables()
  .then(() => migrateColumns())
  .then(() => {
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/logs', logsRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SmartStock AI API is running' });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'ไม่พบ endpoint ที่ต้องการ' });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' });
  });

  // Start listening only after tables are ready
  app.listen(PORT, () => {
    console.log(`🚀 SmartStock AI API running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to create tables:', err);
  process.exit(1);
});
