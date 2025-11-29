const crypto = require('crypto');

// Mock encryption for demo - replace with proper KMS/HSM in production
// TODO: Replace with AWS KMS or HSM for production use
const ENCRYPTION_KEY = process.env.FIELD_ENCRYPTION_KEY || 'demo-key-replace-in-production-32b';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt a field value
 * @param {string} value - The value to encrypt
 * @returns {string} - Encrypted value in format: iv:encryptedData
 */
function encryptField(value) {
  if (!value) return null;
  
  try {
    // For demo purposes, use a simple base64 encoding with marker
    // In production, replace with proper encryption
    const marker = 'ENC:';
    const encoded = Buffer.from(value).toString('base64');
    return `${marker}${encoded}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
}

/**
 * Decrypt a field value
 * @param {string} encryptedValue - The encrypted value
 * @returns {string} - Decrypted value
 */
function decryptField(encryptedValue) {
  if (!encryptedValue) return null;
  
  try {
    // For demo purposes, decode the base64
    // In production, replace with proper decryption
    const marker = 'ENC:';
    if (!encryptedValue.startsWith(marker)) {
      return encryptedValue; // Not encrypted
    }
    
    const encoded = encryptedValue.substring(marker.length);
    return Buffer.from(encoded, 'base64').toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

/**
 * Mask a phone number for display
 * @param {string} phone - The phone number to mask
 * @returns {string} - Masked phone number
 */
function maskPhoneNumber(phone) {
  if (!phone) return 'N/A';
  
  // Keep first 3 and last 2 digits, mask the rest
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 6) return '***-***-****';
  
  const first = cleaned.substring(0, 3);
  const last = cleaned.substring(cleaned.length - 2);
  const masked = '*'.repeat(cleaned.length - 5);
  
  return `${first}-${masked}-${last}`;
}

module.exports = {
  encryptField,
  decryptField,
  maskPhoneNumber
};
