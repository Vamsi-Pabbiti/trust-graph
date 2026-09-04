import mongoose from 'mongoose';

const appealSchema = new mongoose.Schema({
  appealId: { type: String, required: true, unique: true, index: true },
  caseId: { type: String, required: true, index: true },
  actorId: { type: String, required: true, index: true },
  reason: { type: String, required: true },
  supportingEvidence: [{
    docType: String,
    url: String,
    notes: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  status: { 
    type: String, 
    enum: ['submitted', 'under_review', 'more_info_requested', 'accepted', 'rejected', 'expired'], 
    default: 'submitted',
    index: true 
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  submittedAt: { type: Date, default: Date.now },
  dueAt: { type: Date, required: true, index: true },
  reviewedBy: { type: String, default: null },
  reviewerNote: { type: String, default: '' },
  reviewedAt: { type: Date, default: null }
}, {
  timestamps: true
});

export default mongoose.model('Appeal', appealSchema);
