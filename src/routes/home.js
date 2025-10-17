import express from 'express';

const router = express.Router();

// Home route
router.get('/', (req, res) => {
  res.json({
    message: 'SDN302 Cinema Management System - Node.js Backend',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

export default router;