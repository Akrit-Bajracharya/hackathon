import  Merchant from '../models/merchantModel.js';
import Guarantor from '../models/gurantorModel.js';
import Transaction from '../models/transactionModel.js';
import TrustScore from  '../models/trustScore.js';
import NodeCache from 'node-cache';
import {
  calculateBehavioralScore,
  calculateSocialScore,
  calculateSeasonalScore,
  generateNepaliExplanation,
  generateEnglishExplanation
} from '../utils/scoringEngine.js';

// Initialize cache (5 min TTL)
const trustCache = new NodeCache({ stdTTL: 300 });

// @desc    Calculate trust score for merchant
// @route   POST /api/trust/calculate
// @access  Public
export const calculateTrustScore = async (req, res) => {
  try {
    const { merchantId } = req.body;

    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'Merchant ID required'
      });
    }

    // Check cache first
    const cachedScore = trustCache.get(`trust_${merchantId}`);
    if (cachedScore) {
      return res.json({
        success: true,
        data: cachedScore,
        cached: true
      });
    }

    // Get merchant with guarantors and transactions
    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    const guarantors = await Guarantor.find({ merchantId: merchant._id });
    const transactions = await Transaction.find({ merchantId: merchant._id })
      .sort({ timestamp: -1 })
      .limit(100);

    // Calculate component scores
    const behavioralScore = calculateBehavioralScore(transactions);
    const socialScore = calculateSocialScore(guarantors);
    const seasonalScore = calculateSeasonalScore(merchant.shopType);

    // Calculate final score
    const finalScore = Math.min(100, Math.max(0, behavioralScore + socialScore + seasonalScore));

    // Generate explanations
    const explanationNepali = generateNepaliExplanation(finalScore, guarantors.length, false);
    const explanationEnglish = generateEnglishExplanation(finalScore, guarantors.length, false);

    // Save to database
    const trustScore = await TrustScore.create({
      merchantId: merchant._id,
      score: finalScore,
      explanationNepali,
      explanationEnglish,
      fraudFlag: false,
      componentScores: {
        behavioral: behavioralScore,
        social: socialScore,
        seasonal: seasonalScore
      }
    });

    // Cache the result
    trustCache.set(`trust_${merchantId}`, trustScore);

    res.json({
      success: true,
      data: trustScore,
      cached: false
    });
  } catch (error) {
    console.error('Calculate trust score error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during score calculation'
    });
  }
};

// @desc    Get trust score for merchant
// @route   GET /api/trust/:merchantId
// @access  Public
export const getTrustScore = async (req, res) => {
  try {
    const trustScore = await TrustScore.findOne({ 
      merchantId: req.params.merchantId,
      isValid: true
    }).populate('merchantId', 'name shopType location');

    if (!trustScore) {
      return res.status(404).json({
        success: false,
        error: 'Trust score not found'
      });
    }

    res.json({
      success: true,
      data: trustScore
    });
  } catch (error) {
    console.error('Get trust score error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Recalculate trust score
// @route   POST /api/trust/recalculate/:merchantId
// @access  Public
export const recalculateTrustScore = async (req, res) => {
  try {
    // Invalidate cache
    trustCache.del(`trust_${req.params.merchantId}`);

    // Mark old score as invalid
    await TrustScore.updateMany(
      { merchantId: req.params.merchantId },
      { isValid: false }
    );

    // Recalculate
    return await exports.calculateTrustScore(req, res);
  } catch (error) {
    console.error('Recalculate trust score error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during recalculation'
    });
  }
};