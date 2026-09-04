import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/trust_graph';

async function startServer() {
  try {
    console.log('[Trust Graph Backend] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log(`[Trust Graph Backend] Connected to MongoDB at ${MONGODB_URI}`);
  } catch (err) {
    console.warn(`[Trust Graph Backend] MongoDB connection warning: ${err.message}. Backend will run in demo/offline mode.`);
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  TRUST GRAPH Backend Web Service Running`);
    console.log(`  Port: ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Region: India (ap-south-1) - DPDP Compliant`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();
