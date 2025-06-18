import React from 'react';

const PaymentPolicy = () => {
  return (
    <div className="bg-black text-white px-6 py-20 space-y-6">
      <h1 className="text-4xl font-semibold text-center mb-4">Payment Policy</h1>
      <hr className="mx-auto border-red-500 w-[300px] mb-4" />
      <div className="max-w-4xl mx-auto space-y-4 text-m leading-relaxed">
      <p className="max-w-4xl mx-auto text-base leading-relaxed">
        We support multiple payment methods for your convenience and safety:
      </p>
      <ul className="mx-auto mb-20  mt-4  list-disc  space-y-3 px-6">
        <li>Credit/Debit cards (Visa, MasterCard, JCB, etc.)</li>
        <li>E-wallets such as MoMo, ZaloPay, ShopeePay</li>
        <li>Internet Banking from Vietnamese banks</li>
        <li>All transactions are encrypted and secure.</li>
        <li>Tickets are confirmed only after successful payment.</li>
      </ul>
        <p>
          All movie tickets and concession purchases must be paid in full at the time of transaction.
        </p>
        <p>
          We accept a variety of payment methods including credit/debit cards, e-wallets, and online banking.
        </p>
        <p>
          In the event of system errors or failed transactions, please contact our support team within 24 hours for resolution.
        </p>
      </div>
    </div>
  );
};

export default PaymentPolicy;
