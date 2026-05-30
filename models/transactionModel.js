import mongoose from "mongoose"
const transactionSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  type: {
    type: String,
    required: true,
    enum: ['credit', 'debit', 'refund']
  },
  deviceId: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['purchase', 'withdrawal', 'transfer', 'payment', 'refund']
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ merchantId: 1, timestamp: -1 });

const Transaction  = mongoose.model('Transaction', transactionSchema);
export default Transaction