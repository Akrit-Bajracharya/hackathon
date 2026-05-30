import { explanations, getTrustLevel, template } from './nepaliExplanation.js';

// Calculate behavioral score (0-50 points)
function calculateBehavioralScore(transactions) {
  if (!transactions || transactions.length === 0) {
    return 20; // Default for new merchants
  }

  // Transaction frequency (0-15 points)
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const monthlyTransactions = transactions.filter(t => new Date(t.timestamp) > oneMonthAgo);
  const frequencyScore = Math.min(15, (monthlyTransactions.length / 10) * 15);

  // Average amount stability (0-15 points)
  const amounts = transactions.map(t => t.amount);
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(
    amounts.reduce((sum, amt) => sum + Math.pow(amt - avgAmount, 2), 0) / amounts.length
  );
  const stabilityScore = stdDev < avgAmount * 0.5 ? 15 : 10;

  // Refund rate (0-20 points)
  const refunds = transactions.filter(t => t.type === 'refund').length;
  const refundRate = refunds / transactions.length;
  const refundScore = Math.max(0, 20 - (refundRate * 50));

  const total = frequencyScore + stabilityScore + refundScore;
  return Math.min(50, Math.max(0, total));
}

// Calculate social score (0-30 points)
function calculateSocialScore(guarantors) {
  if (!guarantors || guarantors.length === 0) {
    return 5; // Default for no guarantors
  }

  const baseScore = guarantors.length * 10;
  const verifiedBonus = guarantors.filter(g => g.verified).length * 5;
  
  return Math.min(30, baseScore + verifiedBonus);
}

// Calculate seasonal score (0-20 points)
function calculateSeasonalScore(shopType) {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  // Winter season (Nov-Feb) is good for tea shops
  const isWinter = [11, 12, 1, 2].includes(currentMonth);
  const isTeaShop = shopType === 'tea_shop';
  
  if (isTeaShop && isWinter) {
    return 20; // Peak season
  }
  if (isTeaShop && !isWinter) {
    return 12; // Off season
  }
  
  return 15; // Default for other shops
}

// Generate Nepali explanation
function generateNepaliExplanation(score, guarantorCount, fraudDetected) {
  if (fraudDetected) {
    return template(explanations.fraudDetected.nepali, { score });
  }

  const level = getTrustLevel(score);
  return template(explanations[level].nepali, { 
    score, 
    count: guarantorCount 
  });
}

// Generate English explanation
function generateEnglishExplanation(score, guarantorCount, fraudDetected) {
  if (fraudDetected) {
    return template(explanations.fraudDetected.english, { score });
  }

  const level = getTrustLevel(score);
  return template(explanations[level].english, { 
    score, 
    count: guarantorCount 
  });
}

// Extract merchant info from voice transcript (simple regex for demo)
function extractMerchantInfo(transcript) {
  // Simple extraction - in production, use NLP
  const nameMatch = transcript.match(/म हो ([^,]+)/);
  const locationMatch = transcript.match(/([^मा]+)मा/);
  const shopMatch = transcript.match(/(चिया पसल|किराना पसल|रेस्टुरेन्ट)/);
  const walletMatch = transcript.match(/व्यालेट आईडी ([^\s]+)/);

  const shopTypeMap = {
    'चिया पसल': 'tea_shop',
    'किराना पसल': 'grocery',
    'रेस्टुरेन्ट': 'restaurant'
  };

  return {
    name: nameMatch ? nameMatch[1].trim() : 'राम श्रेष्ठ',
    location: locationMatch ? locationMatch[1].trim() : 'काठमाडौं',
    shopType: shopMatch ? shopTypeMap[shopMatch[1]] || 'tea_shop' : 'tea_shop',
    walletId: walletMatch ? walletMatch[1].trim() : '123456'
  };
}

export{
  calculateBehavioralScore,
  calculateSocialScore,
  calculateSeasonalScore,
  generateNepaliExplanation,
  generateEnglishExplanation,
  extractMerchantInfo
};