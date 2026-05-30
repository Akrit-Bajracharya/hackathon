import Merchant from '../models/merchantModel.js';
import  Transaction from '../models/transactionModel.js';
import  Graph from 'graphlib'

// @desc    Check for fraud rings
// @route   POST /api/fraud/check
// @access  Public
export const checkFraud = async (req, res) => {
  try {
    const { merchantId } = req.body;

    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'Merchant ID required'
      });
    }

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found'
      });
    }

    // Get recent transactions
    const transactions = await Transaction.find({
      merchantId: merchant._id,
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Detect fraud patterns
    const fraudResult = detectFraudPatterns(transactions, merchant);

    res.json({
      success: true,
      data: fraudResult
    });
  } catch (error) {
    console.error('Check fraud error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during fraud check'
    });
  }
};

// @desc    Simulate fraud check for demo animation
// @route   POST /api/fraud/check-demo
// @access  Public
export const checkFraudDemo = async (req, res) => {
  // Simulate scanning animation delay
  setTimeout(async () => {
    const { merchantId } = req.body;
    
    const fraudResult = {
      status: 'complete',
      riskLevel: 'low',
      fraudDetected: false,
      checks: {
        circularTransactions: 'passed',
        deviceFingerprint: 'passed',
        ipAnomaly: 'passed',
        refundPattern: 'passed'
      }
    };

    res.json({
      success: true,
      data: fraudResult
    });
  }, 2000);
};

// Fraud detection logic
function detectFraudPatterns(transactions, merchant) {
  const checks = {
    circularTransactions: 'passed',
    deviceFingerprint: 'passed',
    ipAnomaly: 'passed',
    refundPattern: 'passed',
    highFrequency: 'passed'
  };

  let riskScore = 0;
  const flags = [];

  // Check 1: High refund rate
  const refunds = transactions.filter(t => t.type === 'refund');
  const refundRate = refunds.length / transactions.length;
  if (refundRate > 0.3) {
    checks.refundPattern = 'failed';
    riskScore += 20;
    flags.push('उच्च रिफण्ड दर');
  }

  // Check 2: Device fingerprint (same device multiple wallets)
  const deviceMap = {};
  transactions.forEach(t => {
    if (t.deviceId) {
      deviceMap[t.deviceId] = (deviceMap[t.deviceId] || 0) + 1;
    }
  });
  const multiDevice = Object.values(deviceMap).some(count => count > 5);
  if (multiDevice) {
    checks.deviceFingerprint = 'warning';
    riskScore += 10;
  }

  // Check 3: IP anomaly
  const ipMap = {};
  transactions.forEach(t => {
    if (t.ipAddress) {
      ipMap[t.ipAddress] = (ipMap[t.ipAddress] || 0) + 1;
    }
  });
  const multiIP = Object.values(ipMap).some(count => count > 10);
  if (multiIP) {
    checks.ipAnomaly = 'warning';
    riskScore += 10;
  }

  // Check 4: High frequency transactions
  const oneHour = transactions.filter(t => {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return new Date(t.timestamp) > hourAgo;
  });
  if (oneHour.length > 50) {
    checks.highFrequency = 'failed';
    riskScore += 25;
    flags.push('असाधारण उच्चfrequency');
  }

  const fraudDetected = riskScore > 40;
  const riskLevel = fraudDetected ? 'high' : (riskScore > 20 ? 'medium' : 'low');

  return {
    fraudDetected,
    riskLevel,
    riskScore,
    checks,
    flags,
    timestamp: new Date()
  };
}