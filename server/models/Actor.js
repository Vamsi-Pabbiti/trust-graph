import mongoose from 'mongoose';

const actorSchema = new mongoose.Schema({
  actorId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['customer', 'seller', 'delivery_partner'], 
    required: true,
    index: true
  },
  city: { type: String, required: true },
  state: { type: String, required: true },
  cohort: { type: String, required: true }, // e.g. "small_seller", "large_seller", "new_seller", "tier_1_delivery"
  tenureMonths: { type: Number, required: true, default: 1 },
  businessSize: { type: String, enum: ['micro', 'small', 'medium', 'enterprise', 'individual'], default: 'small' },
  riskStatus: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'low',
    index: true
  },
  actionStatus: { 
    type: String, 
    enum: ['active', 'monitored', 'identity_verification_pending', 'payout_hold', 'restricted', 'suspended'], 
    default: 'active' 
  },
  maskedEmail: { type: String, required: true },
  maskedPhone: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model('Actor', actorSchema);
