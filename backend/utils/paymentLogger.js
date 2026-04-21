const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

// Create logs directory if it doesn't exist
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log payment transaction
const logPayment = (paymentDetails) => {
  try {
    const timestamp = new Date().toISOString();
    const logFile = path.join(logsDir, `payments-${new Date().toISOString().split('T')[0]}.log`);

    const logEntry = {
      timestamp,
      bookingId: paymentDetails.bookingId,
      userId: paymentDetails.userId,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency || 'NPR',
      method: paymentDetails.method || 'card',
      status: paymentDetails.status,
      transactionId: paymentDetails.transactionId,
      description: paymentDetails.description || ''
    };

    const logText = `[${timestamp}] ${JSON.stringify(logEntry)}\n`;
    fs.appendFileSync(logFile, logText);

    return { success: true, message: 'Payment logged' };
  } catch (error) {
    console.error('Payment logging error:', error);
    return { success: false, error: error.message };
  }
};

// Log email activity
const logEmail = (emailDetails) => {
  try {
    const timestamp = new Date().toISOString();
    const logFile = path.join(logsDir, `emails-${new Date().toISOString().split('T')[0]}.log`);

    const logEntry = {
      timestamp,
      recipient: emailDetails.recipient,
      subject: emailDetails.subject,
      type: emailDetails.type, // 'reset', 'welcome', 'booking', 'notification'
      status: emailDetails.status,
      userId: emailDetails.userId,
      error: emailDetails.error || null
    };

    const logText = `[${timestamp}] ${JSON.stringify(logEntry)}\n`;
    fs.appendFileSync(logFile, logText);

    return { success: true, message: 'Email logged' };
  } catch (error) {
    console.error('Email logging error:', error);
    return { success: false, error: error.message };
  }
};

// Get payment logs
const getPaymentLogs = (days = 7) => {
  try {
    const logs = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const logFile = path.join(logsDir, `payments-${dateStr}.log`);

      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          try {
            const match = line.match(/\[(.*?)\] (.*)/);
            if (match) {
              logs.push(JSON.parse(match[2]));
            }
          } catch (e) {
            // Skip malformed lines
          }
        });
      }
    }

    return logs;
  } catch (error) {
    console.error('Error reading payment logs:', error);
    return [];
  }
};

// Get email logs
const getEmailLogs = (days = 7) => {
  try {
    const logs = [];
    const now = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const logFile = path.join(logsDir, `emails-${dateStr}.log`);

      if (fs.existsSync(logFile)) {
        const content = fs.readFileSync(logFile, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          try {
            const match = line.match(/\[(.*?)\] (.*)/);
            if (match) {
              logs.push(JSON.parse(match[2]));
            }
          } catch (e) {
            // Skip malformed lines
          }
        });
      }
    }

    return logs;
  } catch (error) {
    console.error('Error reading email logs:', error);
    return [];
  }
};

// Get payment statistics
const getPaymentStats = (days = 7) => {
  try {
    const logs = getPaymentLogs(days);
    const stats = {
      totalTransactions: logs.length,
      successfulTransactions: logs.filter(l => l.status === 'success').length,
      failedTransactions: logs.filter(l => l.status === 'failed').length,
      totalAmount: logs.reduce((sum, l) => sum + (l.amount || 0), 0),
      averageAmount: 0,
      byMethod: {}
    };

    if (stats.totalTransactions > 0) {
      stats.averageAmount = stats.totalAmount / stats.totalTransactions;
    }

    logs.forEach(log => {
      if (!stats.byMethod[log.method]) {
        stats.byMethod[log.method] = { count: 0, amount: 0 };
      }
      stats.byMethod[log.method].count++;
      stats.byMethod[log.method].amount += log.amount || 0;
    });

    return stats;
  } catch (error) {
    console.error('Error calculating payment stats:', error);
    return null;
  }
};

module.exports = {
  logPayment,
  logEmail,
  getPaymentLogs,
  getEmailLogs,
  getPaymentStats
};
