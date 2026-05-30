import  Merchant from '../models/merchantModel.js';
import  Guarantor from '../models/gurantorModel.js';
import  Transaction from '../models/transactionModel.js';

// @desc    Get trust graph data
// @route   GET /api/graph/visualize
// @access  Public
export const getTrustGraph = async (req, res) => {
  try {
    const { merchantId } = req.query;

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

    const guarantors = await Guarantor.find({ merchantId: merchant._id });
    const transactions = await Transaction.find({ merchantId: merchant._id })
      .limit(20);

    // Build graph for D3.js
    const nodes = [
      {
        id: merchant._id.toString(),
        label: merchant.name,
        type: 'merchant',
        shopType: merchant.shopType,
        location: merchant.location
      },
      ...guarantors.map((g, index) => ({
        id: g._id.toString(),
        label: g.name,
        type: 'guarantor',
        relationship: g.relationship,
        trustContribution: g.trustContribution,
        color: getRelationshipColor(g.relationship)
      }))
    ];

    const links = guarantors.map(g => ({
      source: merchant._id.toString(),
      target: g._id.toString(),
      relationship: g.relationship,
      strength: g.trustContribution / 20
    }));

    const graphData = {
      nodes,
      links,
      metadata: {
        merchantName: merchant.name,
        totalGuarantors: guarantors.length,
        totalTransactions: transactions.length,
        generatedAt: new Date()
      }
    };

    res.json({
      success: true,
      data: graphData
    });
  } catch (error) {
    console.error('Get trust graph error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

function getRelationshipColor(relationship) {
  const colors = {
    family: '#e74c3c',
    neighbor: '#3498db',
    friend: '#2ecc71',
    business_partner: '#f39c12',
    community_leader: '#9b59b6'
  };
  return colors[relationship] || '#95a5a6';
}