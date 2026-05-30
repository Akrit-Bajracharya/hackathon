import mongoose from "mongoose"

const guarantorSchema = new mongoose.Schema({
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    enum: ['family', 'neighbor', 'friend', 'business_partner', 'community_leader']
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  trustContribution: {
    type: Number,
    default: 10, // Each guarantor contributes up to 10 points
    min: 0,
    max: 20
  }
}, {
  timestamps: true
});

const Gurantor = mongoose.model('Guarantor', guarantorSchema);
export default Gurantor;