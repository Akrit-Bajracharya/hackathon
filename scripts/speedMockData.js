import 'dotenv/config';
import mongoose from 'mongoose';
import Merchant from '../models/Merchant.js';
import Guarantor from '../models/Guarantor.js';
import Transaction from '../models/Transaction.js';
import TrustScore from '../models/TrustScore.js';
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

// Mock data
const mockMerchants = [
  {
    name: 'राम श्रेष्ठ',
    nameEn: 'Ram Shrestha',
    shopType: 'tea_shop',
    location: 'काठमाडौं, थानकोट',
    locationEn: 'Thanato, Kathmandu',
    walletId: 'WALLET001',
    phoneNumber: '9841000001'
  },
  {
    name: 'सीता शाह',
    nameEn: 'Sita Shah',
    shopType: 'grocery',
    location: 'ललितपुर, पाटन',
    locationEn: 'Patan, Lalitpur',
    walletId: 'WALLET002',
    phoneNumber: '9841000002'
  }
];

const mockGuarantors = [
  { name: 'कृष्ण श्रेष्ठ', relationship: 'family', phoneNumber: '9841000101' },
  { name: 'रीता श्रेष्ठ', relationship: 'family', phoneNumber: '9841000102' },
  { name: 'बिक्रम थापा', relationship: 'neighbor', phoneNumber: '9841000103' }
];

const generateMockTransactions = (merchantId, count = 50) => {
  const transactions = [];
  const types = ['credit', 'debit', 'refund'];
  const categories = ['purchase', 'withdrawal', 'transfer', 'payment'];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    transactions.push({
      merchantId,
      amount: Math.random() * 5000 + 100,
      timestamp: date,
      type: types[Math.floor(Math.random() * types.length)],
      deviceId: `DEVICE_${Math.floor(Math.random() * 3) + 1}`,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      category: categories[Math.floor(Math.random() * categories.length)]
    });
  }
  
  return transactions;
};

async function seedDatabase() {
  try {
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Merchant.deleteMany({});
    await Guarantor.deleteMany({});
    await Transaction.deleteMany({});
    await TrustScore.deleteMany({});

    // Create merchants
    console.log('🏪 Creating merchants...');
    const merchants = await Merchant.create(mockMerchants);

    // Create guarantors for first merchant
    console.log('🤝 Creating guarantors...');
    const guarantors = await Guarantor.create(
      mockGuarantors.map(g => ({ ...g, merchantId: merchants[0]._id }))
    );

    // Create transactions
    console.log('💳 Creating transactions...');
    const transactions1 = generateMockTransactions(merchants[0]._id, 50);
    const transactions2 = generateMockTransactions(merchants[1]._id, 30);
    await Transaction.create([...transactions1, ...transactions2]);

    // Create trust scores
    console.log('📊 Creating trust scores...');
    await TrustScore.create([
      {
        merchantId: merchants[0]._id,
        score: 78,
        explanationNepali: "स्कोर ७८/१००: उच्च विश्वास। ३ जना ग्यारेन्टर, फ्रड छैन, मौसमी pattern स्थिर।",
        explanationEnglish: "Score 78/100: High trust. 3 guarantors, no fraud detected, seasonal pattern stable.",
        fraudFlag: false,
        componentScores: {
          behavioral: 35,
          social: 25,
          seasonal: 18
        }
      },
      {
        merchantId: merchants[1]._id,
        score: 62,
        explanationNepali: "स्कोर ६२/१००: मध्यम विश्वास। ० जना ग्यारेन्टर, केही जोखिम।",
        explanationEnglish: "Score 62/100: Medium trust. 0 guarantors, some risk detected.",
        fraudFlag: false,
        componentScores: {
          behavioral: 30,
          social: 5,
          seasonal: 15
        }
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`📊 ${merchants.length} merchants`);
    console.log(`🤝 ${guarantors.length} guarantors`);
    console.log(`💳 ${transactions1.length + transactions2.length} transactions`);
    console.log(`📊 ${mockMerchants.length} trust scores`);
    console.log('\n🎯 Demo merchant ID:', merchants[0]._id.toString());
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();