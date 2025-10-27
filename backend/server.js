import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import grantsRoutes from './routes/grants.js';
import nafesRoutes from './routes/nafes.js';
import giaRoutes from './routes/gia.js';
import idigRoutes from './routes/idig.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/grants', grantsRoutes);
app.use('/api/nafes', nafesRoutes);
app.use('/api/gia', giaRoutes);
app.use('/api/idig', idigRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'RMD Dashboard API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Network access: http://10.6.7.192:${PORT}`);
});
