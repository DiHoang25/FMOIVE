import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentPage = () => {
  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  const navigate = useNavigate();

  const ticketCount = 3;
  const ticketPrice = 15;
  const serviceFee = 2.5;
  const total = ticketPrice * ticketCount + serviceFee;

  const paymentMethods = [
    {
      id: 'vnpay',
      label: 'VN Pay',
      desc: 'Scan with your online payment system',
    },
    {
      id: 'card',
      label: 'Credit/Debit Card',
      desc: 'Visa, Mastercard, or other cards',
    },
    {
      id: 'bank',
      label: 'Internet Banking',
      desc: 'Connect directly to your bank',
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-neutral-900 rounded-xl p-6 space-y-6 shadow-lg relative">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
        >
          ← Back
        </button>

        <div>
          <h1 className="text-xl font-bold text-center">Complete Your Payment</h1>
          <p className="text-sm text-gray-400 text-center mt-1">
            Scan the QR code or select another payment method
          </p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full text-left px-4 py-3 rounded border ${
                selectedMethod === method.id
                  ? 'border-red-600 bg-zinc-900'
                  : 'border-zinc-800 bg-zinc-800'
              }`}
            >
              <p className="font-semibold">{method.label}</p>
              <p className="text-sm text-gray-400">{method.desc}</p>
            </button>
          ))}
        </div>

        {/* Price Summary */}
        <div className="bg-zinc-800 rounded p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span>Movie Tickets ({ticketCount})</span>
            <span>${(ticketPrice * ticketCount).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          <hr className="border-gray-700" />
          <div className="flex justify-between font-bold text-base">
            <span>Total Amount</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Confirm Notice */}
        <p className="text-xs text-center text-white bg-red-600 rounded py-2 font-semibold">
          You’ll be directed to the third-party payment gateway to complete your transaction.
        </p>
      </div>
    </div>
  );
};

export default PaymentPage;
