const axios = require('axios');

const resolveKhaltiMode = () => {
  const explicitMode = String(process.env.KHALTI_ENV || '').trim().toLowerCase();
  if (explicitMode === 'production' || explicitMode === 'live') return 'production';
  if (explicitMode === 'sandbox' || explicitMode === 'test') return 'sandbox';

  return process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
};

const getKhaltiApiUrl = () => {
  const mode = resolveKhaltiMode();
  return mode === 'production' ? 'https://khalti.com/api/v2' : 'https://dev.khalti.com/api/v2';
};

const getKhaltiKey = () => String(process.env.KHALTI_SECRET_KEY || '').trim();
const isMockKhaltiEnabled = () => {
  const flag = String(process.env.KHALTI_MOCK_MODE || '').trim().toLowerCase();
  return process.env.NODE_ENV !== 'production' && (flag === 'true' || flag === '1' || flag === 'yes');
};

const isMissingOrPlaceholderKey = (key) => {
  if (!key) return true;
  const normalized = key.toLowerCase();
  return (
    normalized.includes('your-khalti-secret-key') ||
    normalized.includes('your_khalti') ||
    normalized.includes('replace_with')
  );
};

const KHALTI_PUBLIC_KEY = process.env.KHALTI_PUBLIC_KEY || 'your-khalti-public-key';
const KHALTI_MERCHANT_USERNAME = process.env.KHALTI_MERCHANT_USERNAME || '';
const KHALTI_MERCHANT_EXTRA = process.env.KHALTI_MERCHANT_EXTRA || '';
const toPaisa = (amount) => Math.round(Number(amount) * 100);

const formatKhaltiError = (rawError) => {
  if (!rawError) return 'Unknown Khalti error.';
  if (typeof rawError === 'string') return rawError;

  if (typeof rawError === 'object') {
    const detail = rawError.detail || rawError.message || rawError.error;
    if (typeof detail === 'string' && detail.trim()) return detail;

    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object') {
        const nested = first.msg || first.message || first.detail;
        if (typeof nested === 'string' && nested.trim()) return nested;
      }
    }

    try {
      return JSON.stringify(rawError);
    } catch (err) {
      return 'Unexpected Khalti error format.';
    }
  }

  return String(rawError);
};

const normalizeKhaltiStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'completed') return 'completed';
  if (normalized === 'pending') return 'pending';
  if (normalized === 'initiated') return 'initiated';
  if (normalized === 'refunded') return 'refunded';
  if (normalized === 'expired') return 'expired';
  if (normalized === 'user canceled' || normalized === 'canceled') return 'canceled';
  return 'unknown';
};

const toKhaltiAmountBreakdown = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return items
    .filter((item) => item && item.label && Number.isFinite(Number(item.amount)))
    .map((item) => ({
      label: String(item.label),
      amount: toPaisa(item.amount),
    }));
};

const toKhaltiProductDetails = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return undefined;
  return items
    .filter((item) => item && item.identity && item.name)
    .map((item) => {
      const quantity = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || item.totalPrice || 0);
      const totalPrice = Number(item.totalPrice || unitPrice * quantity);

      return {
        identity: String(item.identity),
        name: String(item.name),
        total_price: toPaisa(totalPrice),
        quantity,
        unit_price: toPaisa(unitPrice),
      };
    });
};

const buildMockCallbackUrl = ({ returnUrl, pidx, bookingId, amount }) => {
  try {
    const base = returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`;
    const url = new URL(base);
    url.searchParams.set('pidx', pidx);
    url.searchParams.set('status', 'Completed');
    if (bookingId) url.searchParams.set('purchase_order_id', String(bookingId));
    url.searchParams.set('transaction_id', `mock_txn_${Date.now()}`);
    url.searchParams.set('amount', String(toPaisa(amount)));
    return url.toString();
  } catch (err) {
    const fallbackBase = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`;
    return `${fallbackBase}?pidx=${encodeURIComponent(pidx)}&status=Completed&purchase_order_id=${encodeURIComponent(String(bookingId || ''))}&transaction_id=mock_txn_${Date.now()}&amount=${toPaisa(amount)}`;
  }
};

// Initialize payment - Initiates KPG v2 Web Checkout
const initiatePayment = async (paymentDetails) => {
  try {
    const {
      amount,
      mobile,
      email,
      customerName,
      bookingId,
      returnUrl,
      websiteUrl,
      purchaseOrderName,
      amountBreakdown,
      productDetails,
      merchantUsername,
      merchantExtra,
    } = paymentDetails;

    if (isMockKhaltiEnabled()) {
      const mockPidx = `mock_${toPaisa(amount)}_${Date.now()}`;
      return {
        success: true,
        data: {
          pidx: mockPidx,
          payment_url: buildMockCallbackUrl({ returnUrl, pidx: mockPidx, bookingId, amount }),
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          is_mock: true,
        },
        pidx: mockPidx,
        url: buildMockCallbackUrl({ returnUrl, pidx: mockPidx, bookingId, amount }),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      };
    }

    const khaltiKey = getKhaltiKey();
    if (isMissingOrPlaceholderKey(khaltiKey)) {
      return {
        success: false,
        error: 'Khalti is not configured. Set KHALTI_SECRET_KEY in backend/.env and restart backend.',
        rawError: { detail: 'Missing KHALTI_SECRET_KEY' },
      };
    }

    const KHALTI_API_URL = getKhaltiApiUrl();

    const normalizedWebsiteUrl = websiteUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
    const normalizedPurchaseOrderName = purchaseOrderName || `Service Booking - ${bookingId}`;

    const khaltiAmountBreakdown = toKhaltiAmountBreakdown(
      amountBreakdown && amountBreakdown.length > 0
        ? amountBreakdown
        : [{ label: 'Total', amount }]
    );

    const khaltiProductDetails = toKhaltiProductDetails(
      productDetails && productDetails.length > 0
        ? productDetails
        : [
            {
              identity: bookingId,
              name: normalizedPurchaseOrderName,
              totalPrice: amount,
              quantity: 1,
              unitPrice: amount,
            },
          ]
    );

    const payload = {
      return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/`,
      website_url: normalizedWebsiteUrl,
      amount: toPaisa(amount),
      purchase_order_id: bookingId,
      purchase_order_name: normalizedPurchaseOrderName,
      customer_info: {
        name: customerName || 'Customer',
        email: email,
        phone: mobile,
      },
      ...(khaltiAmountBreakdown ? { amount_breakdown: khaltiAmountBreakdown } : {}),
      ...(khaltiProductDetails ? { product_details: khaltiProductDetails } : {}),
      ...(merchantUsername || KHALTI_MERCHANT_USERNAME
        ? { merchant_username: merchantUsername || KHALTI_MERCHANT_USERNAME }
        : {}),
      ...(merchantExtra || KHALTI_MERCHANT_EXTRA
        ? { merchant_extra: merchantExtra || KHALTI_MERCHANT_EXTRA }
        : {}),
    };

    const response = await axios.post(
      `${KHALTI_API_URL}/epayment/initiate/`,
      payload,
      {
        headers: {
          Authorization: `Key ${khaltiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
      pidx: response.data.pidx,
      url: response.data.payment_url,
      expiresAt: response.data.expires_at,
    };
  } catch (error) {
    const rawError = error.response?.data || error.message;
    let formattedError = formatKhaltiError(rawError);
    if (formattedError.toLowerCase().includes('invalid token')) {
      formattedError = `${formattedError} Check KHALTI_SECRET_KEY and KHALTI_ENV (sandbox|production) in backend/.env.`;
    }
    console.error('Khalti Payment Initiation Error:', rawError);
    return {
      success: false,
      error: formattedError,
      rawError,
    };
  }
};

// Verify payment via Khalti Lookup API (KPG v2)
const verifyPayment = async (pidx) => {
  try {
    if (isMockKhaltiEnabled() && String(pidx || '').startsWith('mock_')) {
      const parts = String(pidx).split('_');
      const totalAmount = Number(parts[1] || 0);
      return {
        success: true,
        data: {
          pidx,
          totalAmount,
          status: 'Completed',
          normalizedStatus: 'completed',
          transactionId: `mock_txn_${Date.now()}`,
          fee: 0,
          refunded: false,
        },
        verified: true,
      };
    }

    const khaltiKey = getKhaltiKey();
    if (isMissingOrPlaceholderKey(khaltiKey)) {
      return {
        success: false,
        verified: false,
        error: 'Khalti is not configured. Set KHALTI_SECRET_KEY in backend/.env and restart backend.',
        rawError: { detail: 'Missing KHALTI_SECRET_KEY' },
      };
    }

    const KHALTI_API_URL = getKhaltiApiUrl();
    const payload = { pidx };

    const response = await axios.post(
      `${KHALTI_API_URL}/epayment/lookup/`,
      payload,
      {
        headers: {
          Authorization: `Key ${khaltiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Extract payment details from lookup response
    const paymentData = {
      pidx: response.data.pidx,
      totalAmount: response.data.total_amount,
      status: response.data.status, // 'Completed', 'Pending', 'Refunded', 'Expired', 'User canceled'
      normalizedStatus: normalizeKhaltiStatus(response.data.status),
      transactionId: response.data.transaction_id,
      fee: response.data.fee,
      refunded: response.data.refunded,
    };

    return {
      success: true,
      data: paymentData,
      verified: paymentData.normalizedStatus === 'completed',
    };
  } catch (error) {
    const rawError = error.response?.data || error.message;
    let formattedError = formatKhaltiError(rawError);
    if (formattedError.toLowerCase().includes('invalid token')) {
      formattedError = `${formattedError} Check KHALTI_SECRET_KEY and KHALTI_ENV (sandbox|production) in backend/.env.`;
    }
    console.error('Khalti Payment Verification Error:', rawError);
    return {
      success: false,
      verified: false,
      error: formattedError,
      rawError,
    };
  }
};

// Refund payment
const refundPayment = async (pidx, amount) => {
  try {
    const khaltiKey = getKhaltiKey();
    if (isMissingOrPlaceholderKey(khaltiKey)) {
      return {
        success: false,
        error: 'Khalti is not configured. Set KHALTI_SECRET_KEY in backend/.env and restart backend.',
      };
    }

    const KHALTI_API_URL = getKhaltiApiUrl();
    const payload = {
      pidx: pidx,
      amount: toPaisa(amount),
    };

    const response = await axios.post(
      `${KHALTI_API_URL}/epayment/refund/`,
      payload,
      {
        headers: {
          Authorization: `Key ${khaltiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      data: response.data,
      refundId: response.data.refund_id,
    };
  } catch (error) {
    console.error('Khalti Refund Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

// Generate Khalti public key (for frontend)
const getPublicKey = () => {
  return KHALTI_PUBLIC_KEY;
};

// Get payment history
const getPaymentHistory = async (mobileNumber) => {
  try {
    const khaltiKey = getKhaltiKey();
    if (isMissingOrPlaceholderKey(khaltiKey)) {
      return {
        success: false,
        error: 'Khalti is not configured. Set KHALTI_SECRET_KEY in backend/.env and restart backend.',
      };
    }

    const KHALTI_API_URL = getKhaltiApiUrl();
    const response = await axios.get(
      `${KHALTI_API_URL}/merchant/transaction/`,
      {
        params: {
          customer_phone: mobileNumber,
        },
        headers: {
          Authorization: `Key ${khaltiKey}`,
        },
      }
    );

    return {
      success: true,
      transactions: response.data,
    };
  } catch (error) {
    console.error('Khalti History Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

module.exports = {
  initiatePayment,
  verifyPayment,
  refundPayment,
  getPublicKey,
  getPaymentHistory,
  KHALTI_PUBLIC_KEY,
};
