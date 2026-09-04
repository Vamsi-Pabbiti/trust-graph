import mongoose from 'mongoose';

export function getHealth(req, res) {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    service: 'trust-graph-backend',
    version: '1.0.0',
    region: 'India (ap-south-1)',
    dpdpCompliance: 'India Data Residency Enabled (Local/Region Isolation)',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptimeSeconds: Math.floor(process.uptime())
  });
}
