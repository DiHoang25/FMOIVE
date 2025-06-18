import React from 'react';

const InspectionReturns = () => {
    return (
        <div className="bg-black text-white px-6 py-20 space-y-6">
            <h1 className="text-4xl font-semibold text-center mb-4">Inspection, Returns & Refunds</h1>
            <hr className="mx-auto border-red-500 w-[300px] mb-4" />
            <div className="max-w-4xl mx-auto space-y-4 text-m leading-relaxed">
                <p className="max-w-4xl mx-auto  text-base leading-relaxed">
                    Tickets are non-refundable except under special circumstances:
                </p>
                <ul className=" mx-auto mt-4 list-disc text-base space-y-3 px-6">
                    <li>System errors or cancelled screenings caused by the cinema</li>
                    <li>Duplicate transactions or incorrect deductions</li>
                    <li>Requests must be submitted within 24 hours of the issue</li>
                    <li>Approved refunds will be returned to your original payment method within 7–10 business days</li>
                </ul>
                <p>
                    Tickets once issued are non-refundable except in cases of system error or canceled screenings.
                </p>
                <p>
                    In case of duplicate charges, incorrect showtimes, or screening cancellation, please contact support within 24 hours.
                </p>
                <p>
                    Refunds (if approved) will be returned to your original payment method within 7–10 business days.
                </p>
            </div>
        </div>
    );
};

export default InspectionReturns;
