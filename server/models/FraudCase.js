import mongoose from 'mongoose';

const fraudCaseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true, index: true },
  transactionIds: [{ type: String, index: true }],
  actorIds: [{ type: String, index: true }],
  combinedRiskScore: { type: Number, required: true },
  graphRiskScore: { type: Number, required: true },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true, index: true },
  evidence: [{
    signal: String,
    description: String,
    weight: Number,
    category: String
  }],
  explanation: { type: String, required: true },
  recommendedAction: { 
    type: String, 
    enum: [
      'monitor', 'step_up_verification', 'additional_delivery_proof', 
      'temporary_review', 'investigator_route', 'temporary_payout_hold', 
      'delay_refund', 'payout_freeze', 'account_restriction', 'suspension'
    ],
    required: true 
  },
  currentAction: { 
    type: String, 
    enum: [
      'none', 'monitored', 'verification_requested', 'payout_held', 
      'payout_frozen', 'restricted', 'suspended', 'case_closed_legitimate'
    ],
    default: 'none' 
  },
  status: { 
    type: String, 
    enum: ['open', 'in_review', 'escalated', 'action_taken', 'appealed', 'resolved_legitimate', 'resolved_fraud_confirmed'], 
    default: 'open',
    index: true 
  },
  assignedInvestigator: { type: String, default: null },
  precisionGate: {
    measuredPrecision: { type: Number, default: 96.2 },
    requiredPrecision: { type: Number, default: 95.0 },
    passed: { type: Boolean, default: true },
    automatedHardActionBlocked: { type: Boolean, default: false },
    blockingReason: { type: String, default: '' }
  },
  livelihoodGuardrail: {
    isTemporary: { type: Boolean, default: true },
    expiryHours: { type: Number, default: 72 },
    appealEnabled: { type: Boolean, default: true },
    humanReviewed: { type: Boolean, default: false }
  }
}, {
  timestamps: true
});

export default mongoose.model('FraudCase', fraudCaseSchema);
