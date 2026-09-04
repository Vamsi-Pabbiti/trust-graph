import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true, index: true },
  caseId: { type: String, default: null, index: true },
  actorId: { type: String, default: null, index: true },
  action: { type: String, required: true },
  reason: { type: String, required: true },
  performedBy: { type: String, required: true },
  previousHash: { type: String, required: true },
  currentHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

export default mongoose.model('AuditEvent', auditEventSchema);
