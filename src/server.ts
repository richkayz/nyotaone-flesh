import 'dotenv/config';
import express from 'express';
import { testDatabaseConnection } from './database/db.js';
import authRoutes from './routes/auth.js';
import pleskRoutes from './routes/plesk.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/plesk', pleskRoutes);

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