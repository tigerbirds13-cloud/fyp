const axios = require('axios');
const { randomUUID } = require('crypto');
const { generateEsewaSignature } = require('./generateEsewaSignature');

const ESEWA_FORM_URL = process.env.ESEWA_FORM_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_VERIFY_URL = process.env.ESEWA_VERIFY_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/';

const getEsewaConfig = () => {
  const merchantCode = process.env.ESEWA_MERCHANT_CODE || process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE;
  const secretKey = process.env.ESEWA_SECRET_KEY || process.env.NEXT_PUBLIC_ESEWA_SECRET_KEY;

  if (!merchantCode || !secretKey) {
    throw new Error('Missing eSewa configuration. Set ESEWA_MERCHANT_CODE and ESEWA_SECRET_KEY.');
  }

  return {
    merchantCode,
    secretKey,
  };
};

const normalizeAmount = (amount) => Number(Number(amount).toFixed(2));

const buildSignedMessage = (signedFieldNames, payload) => {
  return signedFieldNames
    .split(',')
    .map((fieldName) => fieldName.trim())
    .filter(Boolean)
    .map((fieldName) => `${fieldName}=${payload[fieldName]}`)
    .join(',');
};

const decodeCallbackData = (encodedData) => {
  try {
    const decodedString = Buffer.from(encodedData, 'base64').toString('utf8');
    return JSON.parse(decodedString);
  } catch (error) {
    throw new Error('Invalid eSewa callback payload.');
  }
};

const initiatePayment = ({ amount, bookingId, successUrl, failureUrl }) => {
  const { merchantCode, secretKey } = getEsewaConfig();
  const normalizedAmount = normalizeAmount(amount);
  const transactionUuid = `${bookingId}-${Date.now()}-${randomUUID()}`;
  const payload = {
    amount: String(normalizedAmount),
    tax_amount: '0',
    total_amount: String(normalizedAmount),
    transaction_uuid: transactionUuid,
    product_code: merchantCode,
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: 'total_amount,transaction_uuid,product_code',
  };

  const signature = generateEsewaSignature(
    secretKey,
    buildSignedMessage(payload.signed_field_names, payload)
  );

  return {
    success: true,
    transactionUuid,
    gatewayUrl: ESEWA_FORM_URL,
    payload: {
      ...payload,
      signature,
    },
  };
};

const verifyPayment = async ({ encodedData }) => {
  try {
    const { merchantCode, secretKey } = getEsewaConfig();
    const decoded = decodeCallbackData(encodedData);

    if (decoded.signed_field_names && decoded.signature) {
      const expectedSignature = generateEsewaSignature(
        secretKey,
        buildSignedMessage(decoded.signed_field_names, decoded)
      );

      if (decoded.signature !== expectedSignature) {
        return {
          success: false,
          verified: false,
          error: 'Invalid eSewa signature.',
        };
      }
    }

    const response = await axios.get(ESEWA_VERIFY_URL, {
      params: {
        product_code: decoded.product_code || merchantCode,
        total_amount: decoded.total_amount,
        transaction_uuid: decoded.transaction_uuid,
      },
    });

    const status = String(response.data.status || decoded.status || '').toUpperCase();

    return {
      success: true,
      verified: status === 'COMPLETE',
      decoded,
      data: {
        status,
        totalAmount: normalizeAmount(response.data.total_amount || decoded.total_amount),
        transactionUuid: response.data.transaction_uuid || decoded.transaction_uuid,
        referenceId:
          response.data.ref_id ||
          response.data.transaction_code ||
          decoded.transaction_code ||
          decoded.reference_id ||
          null,
        productCode: response.data.product_code || decoded.product_code || merchantCode,
      },
    };
  } catch (error) {
    return {
      success: false,
      verified: false,
      error: error.response?.data || error.message,
    };
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  normalizeAmount,
};