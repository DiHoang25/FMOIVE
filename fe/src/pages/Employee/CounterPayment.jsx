import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    movieDetails = {},
    selectedShowtimeTime = '',
    fullShowtimeDate = '',
    selectedSeats = [],
    selectedCombos = [],
    ticketPrice = 0,
    serviceFee = 2.50,
    combosTotal = 0,
    finalTotal = 0,
    userInformation = {},
  } = state || {};

  const [selectedMethod, setSelectedMethod] = useState('vnpay');
  const [showCashConfirmModal, setShowCashConfirmModal] = useState(false);

  const displayTotal = finalTotal.toFixed(2);
  const displayTicketCount = selectedSeats.length;
  const displayTicketPrice = ticketPrice;
  const displayCombosTotal = combosTotal;

  const paymentMethods = [
    {
      id: 'vnpay',
      label: 'VN Pay',
      desc: 'Scan to pay with VN Pay (Online Payment)',
      
    },
    {
      id: 'cash',
      label: 'Cash Payment',
      desc: 'Confirm payment with staff at the counter',
      
    },
  ];

  const handlePayNow = () => {
    if (selectedMethod === 'cash') {
      setShowCashConfirmModal(true);
    } else if (selectedMethod === 'vnpay') {
      alert('Redirecting to VN Pay gateway (simulated)...');
      handlePaymentConfirmed();
    }
  };

  const handlePaymentConfirmed = () => {
    setShowCashConfirmModal(false);
    navigate('/employee/counter-payment-success', {
      state: {
        movieDetails,
        selectedShowtimeTime,
        fullShowtimeDate,
        selectedSeats,
        selectedCombos,
        ticketPrice,
        serviceFee,
        combosTotal,
        finalTotal,
        userInformation,
      },
    });
  };

  const handleCloseModal = () => {
    setShowCashConfirmModal(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full bg-neutral-900 rounded-xl p-6 space-y-6 shadow-lg relative">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded-md text-sm font-medium"
        >
          ← Back
        </button>

        <div className="pt-8">
          <h1 className="text-2xl font-bold text-center mb-6">Complete Your Payment</h1>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">Choose Payment Method:</h3>
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                selectedMethod === method.id
                  ? 'border-red-600 bg-zinc-800 shadow-lg'
                  : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
              }`}
            >
              <span className="text-3xl">{method.icon}</span>
              <div>
                <p className="font-semibold text-lg">{method.label}</p>
                <p className="text-sm text-gray-400 mt-1">{method.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Price Summary */}
        <div className="bg-zinc-800 rounded-lg p-5 text-base space-y-3 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Order Summary:</h3>
          <div className="flex justify-between">
            <span>Movie Tickets ({displayTicketCount})</span>
            <span>${displayTicketPrice.toFixed(2)}</span>
          </div>
          {selectedCombos.length > 0 && (
            <div className="flex justify-between">
              <span>Combos & Snacks</span>
              <span>${displayCombosTotal.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Service Fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
          
          <hr className="border-gray-700 my-2" />
          <div className="flex justify-between font-bold text-xl text-red-400">
            <span>Total Amount</span>
            <span>${displayTotal}</span>
          </div>
        </div>

        {/* Confirm Notice / Action Button */}
        <div className="mt-6">
            {selectedMethod === 'vnpay' && (
                <p className="text-xs text-center text-white bg-gray-700 rounded-md py-3 px-4 font-semibold"> {/* Changed from blue to gray */}
                    You'll be directed to the VN Pay gateway to complete your transaction.
                </p>
            )}
            {selectedMethod === 'cash' && (
                <p className="text-xs text-center text-white bg-red-600 rounded-md py-3 px-4 font-semibold"> {/* Changed from green to red */}
                    Please collect cash from the customer and then confirm payment below.
                </p>
            )}

            <button
                onClick={handlePayNow}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold text-lg mt-4 shadow-xl transform transition-transform duration-200 hover:scale-[1.02]"
            >
                Pay Now
            </button>
        </div>
      </div>

      {/* Cash Payment Confirmation Modal */}
      {showCashConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl p-8 shadow-2xl text-center relative max-w-sm w-full border border-gray-700">
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <XCircle size={24} />
            </button>
            <h2 className="text-2xl font-bold text-red-500 mb-4">Confirm Cash Payment</h2>
            <p className="text-gray-300 mb-6 text-base">
              Has the customer paid the full amount of <span className="font-bold text-red-400">${displayTotal}</span> in cash?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleCloseModal}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirmed}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors" // Changed from green to red
              >
                Confirm Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;