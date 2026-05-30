import mongoose from "mongoose"

const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  shopType: {
    type: String,
    required: true,
    enum: ['tea_shop', 'grocery', 'restaurant', 'clothing', 'other']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  walletId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  voiceTranscript: {
    type: String,
    default: ''
  },
  onboardedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Merchant = mongoose.model('Merchant', merchantSchema);
export default Merchant