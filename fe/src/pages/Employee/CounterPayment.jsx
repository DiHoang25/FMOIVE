import { useNavigate } from 'react-router-dom';
import QR from '../../assets/qrcode.png'; // Replace with real QR image

const PaymentCounter = () => {
  const navigate = useNavigate();

  // Normally you'd pass this via props, state, or context
  const totalAmount = 61.5; // Example: from ConfirmBooking
  const bank = {
    accountName: 'Cinema Manager',
    bankName: 'Bank of Vietnam',
    accountNumber: '1234567890',
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-neutral-900 rounded-2xl p-8 shadow-lg text-center">

        <h1 className="text-3xl font-bold mb-8 text-red-500">💳 Make Your Payment</h1>

        <p className="text-lg text-gray-300 mb-6">
          Scan the QR code below to complete your payment.
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <img src={QR} alt="QR Code" className="w-60 h-60 border-4 border-white rounded-lg" />
        </div>

        {/* Amount & Bank Info */}
        <div className="bg-zinc-800 rounded-xl p-6 space-y-4 text-left text-base">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Amount:</span>
            <span className="font-bold text-white text-lg">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Account Name:</span>
            <span>{bank.accountName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Bank Name:</span>
            <span>{bank.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Account Number:</span>
            <span>{bank.accountNumber}</span>
          </div>
        </div>

        

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => navigate(-1)}
            className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded"
          >
            ← Back
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default PaymentCounter;
