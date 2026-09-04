import mongoose from 'mongoose';

const systemConfigurationSchema = new mongoose.Schema({
  lowRiskThreshold: { type: Number, default: 25 },
  mediumRiskThreshold: { type: Number, default: 50 },
  highRiskThreshold: { type: Number, default: 75 },
  criticalRiskThreshold: { type: Number, default: 90 },
  hardActionPrecisionThreshold: { type: Number, default: 95.0 }, // 95% measured precision required for automated hard actions
  appealSlaHours: { type: Number, default: 48 },
  actionExpiryHours: { type: Number, default: 72 },
  scoringWeights: {
    refundCount30Days: { type: Number, default: 18 },
    chargebackCount: { type: Number, default: 18 },
    sellerRatingBurst: { type: Number, default: 17 },
    gpsDeviationKm: { type: Number, default: 20 },
    proofOfDeliveryMismatch: { type: Number, default: 22 },
    nightOrder: { type: Number, default: 6 },
    highValue: { type: Number, default: 8 },
    youngAccount: { type: Number, default: 8 }
  },
  updatedBy: { type: String, default: 'system' }
}, {
  timestamps: true
});

export default mongoose.model('SystemConfiguration', systemConfigurationSchema);
