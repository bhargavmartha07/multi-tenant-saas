const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testDbConnection } = require('./config/db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Health Check Endpoint (MANDATORY)
app.get('/api/health', async (req, res) => {
    const dbConnected = await testDbConnection();
  
    return res.status(200).json({
      status: 'ok',
      database: dbConnected ? 'connected' : 'not_connected',
      timestamp: new Date().toISOString()
    });
  });
  

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
