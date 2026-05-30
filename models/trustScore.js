import mongoose from "mongoose"

const trustScoreSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    unique: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  explanationNepali: {
    type: String,
    required: true
  },
  explanationEnglish: {
    type: String,
    required: true
  },
  fraudFlag: {
    type: Boolean,
    default: false
  },
  fraudReason: {
    type: String,
    default: ''
  },
  componentScores: {
    behavioral: {
      type: Number,
      min: 0,
      max: 50
    },
    social: {
      type: Number,
      min: 0,
      max: 30
    },
    seasonal: {
      type: Number,
      min: 0,
      max: 20
    }
  },
  calculatedAt: {
    type: Date,
    default: Date.now
  },
  isValid: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Trust = mongoose.model('TrustScore', trustScoreSchema);
export default Trust;