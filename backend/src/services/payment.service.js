/**
 * Mock payment service to simulate a payment gateway like Stripe or Razorpay.
 * Simulates a success rate of 80%.
 */
const simulatePayment = async (amount, method) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.2;
      resolve({
        success: isSuccess,
        transactionId: `txn_${Math.random().toString(36).substring(2, 15)}`,
        status: isSuccess ? 'SUCCESS' : 'FAILED',
        amount,
        method: method || 'card'
      });
    }, 1000); // 1 second mock delay
  });
};

module.exports = { simulatePayment };
