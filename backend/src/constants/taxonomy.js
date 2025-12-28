/**
 * Taxonomy Constants for Phishing Training Platform
 * 
 * Stable internal codes for threat types, subtypes, and channel vectors.
 * Display labels can change without affecting analytics/scoring.
 */

// Top-level threat types (mutually exclusive in most questions)
const THREAT_TYPES = {
    BENIGN: { code: 'BENIGN', label: 'Not malicious / Benign' },
    PHISHING: { code: 'PHISHING', label: 'Phishing' },
    MALWARE: { code: 'MALWARE', label: 'Malware' },
    SOCIAL_ENGINEERING: { code: 'SOCIAL_ENGINEERING', label: 'Social Engineering' },
    SCAM: { code: 'SCAM', label: 'Scam / Fraud' },
    SPAM: { code: 'SPAM', label: 'Spam / Marketing' }
};

// Phishing subtypes
const PHISHING_SUBTYPES = {
    PHISHING_SPEAR: { code: 'PHISHING_SPEAR', label: 'Spear Phishing', parent: 'PHISHING' },
    PHISHING_WHALING: { code: 'PHISHING_WHALING', label: 'Whaling (Executive-targeted)', parent: 'PHISHING' },
    PHISHING_BEC: { code: 'PHISHING_BEC', label: 'Business Email Compromise (BEC)', parent: 'PHISHING' },
    PHISHING_CREDENTIAL: { code: 'PHISHING_CREDENTIAL', label: 'Credential Harvesting', parent: 'PHISHING' },
    PHISHING_LINK: { code: 'PHISHING_LINK', label: 'Link-based Phishing', parent: 'PHISHING' },
    PHISHING_ATTACHMENT: { code: 'PHISHING_ATTACHMENT', label: 'Attachment-based Phishing', parent: 'PHISHING' },
    PHISHING_CLONE: { code: 'PHISHING_CLONE', label: 'Clone Phishing', parent: 'PHISHING' }
};

// Malware-related subtypes
const MALWARE_SUBTYPES = {
    MALWARE_RANSOMWARE: { code: 'MALWARE_RANSOMWARE', label: 'Ransomware', parent: 'MALWARE' },
    MALWARE_TROJAN: { code: 'MALWARE_TROJAN', label: 'Trojan', parent: 'MALWARE' },
    MALWARE_KEYLOGGER: { code: 'MALWARE_KEYLOGGER', label: 'Keylogger', parent: 'MALWARE' },
    MALWARE_INFOSTEALER: { code: 'MALWARE_INFOSTEALER', label: 'Info-stealer', parent: 'MALWARE' },
    MALWARE_LOADER: { code: 'MALWARE_LOADER', label: 'Loader / Dropper', parent: 'MALWARE' }
};

// Channel/vector tags (can be multi-select, not exclusive)
const CHANNEL_VECTORS = {
    EMAIL: { code: 'EMAIL', label: 'Email' },
    SMS: { code: 'SMS', label: 'SMS / Smishing' },
    VOICE: { code: 'VOICE', label: 'Voice / Vishing' },
    SOCIAL_MEDIA: { code: 'SOCIAL_MEDIA', label: 'Social Media DM' },
    WEBSITE: { code: 'WEBSITE', label: 'Website / Landing Page' },
    QR: { code: 'QR', label: 'QR / Quishing' }
};

// All subtypes combined for easy lookup
const ALL_SUBTYPES = {
    ...PHISHING_SUBTYPES,
    ...MALWARE_SUBTYPES
};

// Content types for questions
const CONTENT_TYPES = ['email', 'sms', 'url', 'voice', 'social', 'qrcode'];

// Question types
const QUESTION_TYPES = {
    SINGLE: 'single',    // Single best answer
    MULTI: 'multi'       // Select all that apply
};

// Helper to get all types as array for dropdowns
const getThreatTypesArray = () => Object.values(THREAT_TYPES);
const getPhishingSubtypesArray = () => Object.values(PHISHING_SUBTYPES);
const getMalwareSubtypesArray = () => Object.values(MALWARE_SUBTYPES);
const getChannelVectorsArray = () => Object.values(CHANNEL_VECTORS);

// Get subtypes for a given parent type
const getSubtypesForType = (typeCode) => {
    return Object.values(ALL_SUBTYPES).filter(st => st.parent === typeCode);
};

// Validate a code exists
const isValidCode = (code) => {
    return THREAT_TYPES[code] || ALL_SUBTYPES[code] || CHANNEL_VECTORS[code];
};

module.exports = {
    THREAT_TYPES,
    PHISHING_SUBTYPES,
    MALWARE_SUBTYPES,
    CHANNEL_VECTORS,
    ALL_SUBTYPES,
    CONTENT_TYPES,
    QUESTION_TYPES,
    getThreatTypesArray,
    getPhishingSubtypesArray,
    getMalwareSubtypesArray,
    getChannelVectorsArray,
    getSubtypesForType,
    isValidCode
};
