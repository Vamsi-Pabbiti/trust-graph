import mongoose from 'mongoose';

const graphEdgeSchema = new mongoose.Schema({
  sourceNodeId: { type: String, required: true, index: true },
  targetNodeId: { type: String, required: true, index: true },
  edgeType: { 
    type: String, 
    enum: [
      'placed_order', 'sold_item', 'delivered_order', 
      'used_device', 'used_ip', 'used_address', 
      'submitted_refund', 'shared_suspicious_signal'
    ], 
    required: true 
  },
  strength: { type: Number, default: 1 },
  firstObservedAt: { type: Date, default: Date.now },
  lastObservedAt: { type: Date, default: Date.now },
  transactionIds: [{ type: String }],
  evidence: { type: String, default: '' }
}, {
  timestamps: true
});

graphEdgeSchema.index({ sourceNodeId: 1, targetNodeId: 1, edgeType: 1 }, { unique: true });

export default mongoose.model('GraphEdge', graphEdgeSchema);
