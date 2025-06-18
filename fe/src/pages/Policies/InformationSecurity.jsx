import React from 'react';

const InformationSecurity = () => {
  return (
    <div className="bg-black text-white px-6 py-20 space-y-6">
      <h1 className="text-4xl font-semibold text-center mb-4">Information Security</h1>
      <hr className="mx-auto border-red-500 w-[300px] mb-4" />
      <div className="max-w-4xl mx-auto space-y-4 text-m leading-relaxed">
      <p className="max-w-4xl mx-auto text-base leading-relaxed">
        We are committed to protecting your personal information. This includes:
      </p>
      <ul className=" mx-auto mt-4 list-disc text-base space-y-3 px-6">
        <li>Full name, email, phone number, and payment details</li>
        <li>Information is used only for ticket confirmation and customer support</li>
        <li>We do not sell or share data with third parties</li>
        <li>Our system is secured using modern encryption technologies</li>
        <li>You may request to edit or delete your data at any time</li>
      </ul>
        <p>
          We are committed to protecting your personal information and online transaction data through secure encryption protocols.
        </p>
        <p>
          Your payment details are never stored on our servers. All transactions are processed through certified payment gateways.
        </p>
        <p>
          For more details, please refer to our Privacy Policy or contact our data protection officer.
        </p>
      </div>
    </div>
  );
};

export default InformationSecurity;
