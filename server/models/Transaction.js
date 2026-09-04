import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, required: true, index: true },
  customerId: { type: String, required: true, index: true },
  sellerId: { type: String, required: true, index: true },
  deliveryPartnerId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  city: { type: String, required: true },
  orderTime: { type: Date, default: Date.now },
  deviceId: { type: String, required: true, index: true },
  ipAddress: { type: String, required: true, index: true },
  addressHash: { type: String, required: true, index: true },
  refundCount30Days: { type: Number, default: 0 },
  chargebackCount: { type: Number, default: 0 },
  sellerRatingBurst: { type: Number, default: 0 },
  gpsDeviationKm: { type: Number, default: 0 },
  proofOfDeliveryMismatch: { type: Boolean, default: false },
  accountAgeDays: { type: Number, default: 30 },
  historicalLabel: { type: String, enum: ['fraud', 'legitimate', 'unknown'], default: 'unknown' },
  transactionRiskScore: { type: Number, default: 0 },
  graphRiskScore: { type: Number, default: 0 },
  combinedRiskScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low', index: true },
  triggeredSignals: [{
    code: String,
    name: String,
    weight: Number,
    evidence: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Transaction', transactionSchema);
