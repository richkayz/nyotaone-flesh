
import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { testDatabaseConnection } from './database/db.js';
import authRoutes from './routes/auth.js';
import pleskRoutes from './routes/plesk.js';
import customerRoutes from './routes/customers.js';
import helmet from 'helmet';

const app = express();

const PORT = Number(process.env.PORT || 3000);
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/plesk', pleskRoutes);
app.use('/api/customers', customerRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await testDatabaseConnection();

    res.json({
      application: 'NyotaOne',
      status: 'healthy',
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check failed:', error);

    res.status(503).json({
      application: 'NyotaOne',
      status: 'unhealthy',
      database: 'disconnected',
    });
  }
});

async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(PORT, '127.0.0.1', () => {
      console.log(`NyotaOne running at http://localhost:${PORT}`);
      console.log('MariaDB connection successful');
    });
  } catch (error) {
    console.error('NyotaOne startup failed:', error);
    process.exit(1);
  }
}

startServer();
