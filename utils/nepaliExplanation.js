const explanations = {
  highTrust: {
    nepali: "स्कोर {{score}}/१००: उच्च विश्वास। {{count}} जना ग्यारेन्टर, फ्रड छैन, मौसमी pattern स्थिर।",
    english: "Score {{score}}/100: High trust. {{count}} guarantors, no fraud detected, seasonal pattern stable."
  },
  mediumTrust: {
    nepali: "स्कोर {{score}}/१००: मध्यम विश्वास। {{count}} जना ग्यारेन्टर, केही जोखिम।",
    english: "Score {{score}}/100: Medium trust. {{count}} guarantors, some risk detected."
  },
  lowTrust: {
    nepali: "स्कोर {{score}}/१००: कम विश्वास। अझै पुष्टि आवश्यक।",
    english: "Score {{score}}/100: Low trust. Additional verification required."
  },
  fraudDetected: {
    nepali: "स्कोर {{score}}/१००: फ्रड पत्ता लाग्यो! तत्काल जाँच गर्नुहोस्।",
    english: "Score {{score}}/100: Fraud detected! Immediate verification required."
  }
};

function getTrustLevel(score) {
  if (score >= 75) return 'highTrust';
  if (score >= 50) return 'mediumTrust';
  return 'lowTrust';
}

function template(text, data) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] || '');
}

export {
  explanations,
  getTrustLevel,
  template
};