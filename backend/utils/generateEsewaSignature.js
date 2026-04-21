const crypto = require('crypto');

const generateEsewaSignature = (secretKey, message) => {
  return crypto.createHmac('sha256', secretKey).update(message).digest('base64');
};

module.exports = { generateEsewaSignature };