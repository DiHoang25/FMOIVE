import React from 'react';

const DeliveryPolicy = () => {
    return (
        <div className="bg-black text-white px-6 py-20 space-y-6">
            <h1 className="text-4xl font-semibold text-center mb-4">Delivery Policy</h1>
            <hr className="mx-auto border-red-500 w-[300px] mb-4" />
            <div className="max-w-4xl mx-auto space-y-4 text-m leading-relaxed">
                <p className="max-w-4xl mx-auto  text-base leading-relaxed">
                    Upon successful payment, your tickets will be delivered through the following methods:
                </p>
                <ul className="mx-auto mt-4 list-disc space-y-3 px-6">
                    <li>Email confirmation with a QR code</li>
                    <li>SMS containing the ticket code</li>
                    <li>Stored in your member account on our website</li>
                    <li>Show your QR code or phone number upon arrival at the cinema</li>
                </ul>
                <p>
                    Tickets purchased online will be delivered via email or accessible directly in your member dashboard.
                </p>
                <p>
                    Please ensure your email address is entered correctly. We are not responsible for delivery failures due to incorrect information.
                </p>
                <p>
                    Physical merchandise, if available, will be delivered according to shipping method selected during checkout.
                </p>
            </div>
        </div>
    );
};

export default DeliveryPolicy;
