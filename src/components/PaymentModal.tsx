import React, { useEffect } from 'react';
import { api } from '../services/api';
import { CreditCard, Smartphone, CheckCircle, XCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | number;
  amount: number;
  onSuccess: () => void;
  onFailure: (error: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, bookingId, amount, onSuccess, onFailure }) => {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      // 1. Create order on backend
      const orderData = await api.createPaymentOrder({ booking_id: bookingId });

      if (orderData.mock) {
        // Mock Gateway Simulation
        setTimeout(async () => {
          try {
            await api.verifyPayment({
              razorpay_order_id: orderData.order_id,
              razorpay_payment_id: `mock_pay_${Date.now()}`,
              razorpay_signature: `mock_sig_valid`,
              payment_id: orderData.payment_id
            });
            onSuccess();
          } catch (err: any) {
            onFailure(err.response?.data?.error || 'Mock Verification Failed');
          }
        }, 1500);
        return;
      }

      // 2. Real Razorpay Integration
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_example', 
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Appointly',
        description: 'Appointment Booking Advance',
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: orderData.payment_id
            });
            onSuccess();
          } catch (err: any) {
            onFailure('Payment verification failed on server.');
          }
        },
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#6366f1' // Indigo-500
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        onFailure(response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      onFailure(err.response?.data?.error || 'Failed to initialize payment.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 bg-gray-900 border border-gray-800 shadow-xl rounded-2xl">
        <h2 className="mb-2 text-2xl font-bold text-white">Complete Payment</h2>
        <p className="mb-6 text-gray-400">Advance payment required to confirm your booking.</p>
        
        <div className="p-4 mb-6 text-center border border-indigo-500/30 bg-indigo-500/10 rounded-xl">
          <span className="block text-sm text-indigo-300">Amount to Pay</span>
          <span className="text-4xl font-bold text-indigo-400">₹{amount}</span>
        </div>

        <div className="space-y-3">
          <button 
            onClick={handlePayment}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-white transition-colors bg-indigo-600 rounded-xl hover:bg-indigo-700"
          >
            <CreditCard className="w-5 h-5" />
            Pay via Razorpay / UPI
          </button>
          
          <button 
            onClick={handlePayment}
            className="flex items-center justify-center w-full gap-2 px-4 py-3 font-medium text-gray-300 transition-colors border border-gray-700 bg-gray-800/50 rounded-xl hover:bg-gray-800"
          >
            <Smartphone className="w-5 h-5" />
            Pay with Wallet (Paytm/GPay)
          </button>
        </div>

        <div className="mt-6 text-center">
          <button onClick={onClose} className="text-sm text-gray-500 transition-colors hover:text-gray-300">
            Cancel Payment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
