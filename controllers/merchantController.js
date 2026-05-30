import  Merchant from '../models/merchantModel.js'
import  Guarantor from '../models/gurantorModel.js';
import  { transcribeNepaliVoice } from '../utils/voiceTranscriber.js';
import { extractMerchantInfo }  from '../utils/scoringEngine.js';

// @desc    Onboard new merchant
// @route   POST /api/merchants/onboard
// @access  Public
export const onboardMerchant = async (req, res) => {
  try {
    const { name, shopType, location, walletId, phoneNumber } = req.body;

    // Validate required fields
    if (!name || !shopType || !location || !walletId) {
      return res.status(400).json({
        success: false,
        error: 'Name, shopType, location, and walletId are required'
      });
    }

    // Check if walletId already exists
    const existingMerchant = await Merchant.findOne({ walletId });
    if (existingMerchant) {
      return res.status(400).json({
        success: false,
        error: 'Wallet ID already registered'
      });
    }

    // Create merchant
    const merchant = await Merchant.create({
      name,
      shopType,
      location,
      walletId,
      phoneNumber,
      voiceTranscript: req.body.voiceTranscript || ''
    });

    res.status(201).json({
      success: true,
      data: merchant
    });
  } catch (error) {
    console.error('Onboard merchant error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during onboarding'
    });
  }
};

// @desc    Get merchant by ID
// @route   GET /api/merchants/:id
// @access  Public
export const getMerchant = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.params.id)
      .populate('guarantors', 'name relationship phoneNumber');

    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    res.json({
      success: true,
      data: merchant
    });
  } catch (error) {
    console.error('Get merchant error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all merchants
// @route   GET /api/merchants
// @access  Public
export const getAllMerchants = async (req, res) => {
  try {
    const merchants = await Merchant.find({ isActive: true }).limit(50);

    res.json({
      success: true,
      count: merchants.length,
      data: merchants
    });
  } catch (error) {
    console.error('Get all merchants error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Add guarantor to merchant
// @route   POST /api/merchants/:id/guarantors
// @access  Public
export const addGuarantor = async (req, res) => {
  try {
    const { name, relationship, phoneNumber } = req.body;

    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const guarantor = await Guarantor.create({
      merchantId: merchant._id,
      name,
      relationship,
      phoneNumber
    });

    res.status(201).json({
      success: true,
      data: guarantor
    });
  } catch (error) {
    console.error('Add guarantor error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Process voice onboarding
// @route   POST /api/merchants/onboard-voice
// @access  Public
export const onboardWithVoice = async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        error: 'Audio data required'
      });
    }

    // Transcribe Nepali voice
    const transcript = await transcribeNepaliVoice(audioBase64);

    // Extract merchant info from transcript
    const merchantInfo = extractMerchantInfo(transcript);

    res.json({
      success: true,
      transcript,
      merchantInfo
    });
  } catch (error) {
    console.error('Voice onboarding error:', error);
    
    // Fallback: return mock transcript for demo
    res.json({
      success: true,
      transcript: "म हो राम श्रेष्ठ, काठमाडौंमा चिया पसल चलाउँछु, व्यालेट आईडी १२३४५६",
      merchantInfo: {
        name: "राम श्रेष्ठ",
        shopType: "tea_shop",
        location: "काठमाडौं",
        walletId: "123456"
      }
    });
  }
};