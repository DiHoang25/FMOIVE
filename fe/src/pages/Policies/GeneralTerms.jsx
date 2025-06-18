import React from 'react';

const GeneralTerms = () => {
    return (
        <div className="bg-black text-white px-6 py-20 space-y-6">
            <h1 className="text-4xl font-semibold text-center mb-4">General Terms</h1>
            <hr className="mx-auto border-red-500 w-[300px] mb-4" />
            <div className="max-w-4xl mx-auto space-y-4 text-m leading-relaxed">
                <p className=" mx-auto  text-base leading-relaxed">
                    By using our services, you agree to the following terms and conditions:
                </p>
                <ul className="mx-auto mt-4 list-disc text-base space-y-3 px-6">
                    <li>Customers must provide accurate information when booking tickets.</li>
                    <li>Tickets are only valid for the specified screening time and date.</li>
                    <li>Tickets are non-refundable or exchangeable unless due to system errors.</li>
                    <li>Outside food and drinks are not allowed in the cinema (unless permitted).</li>
                    <li>We reserve the right to refuse service if our house rules are violated.</li>
                </ul>
                <p>
                    These general terms govern your access and use of our cinema services, including online ticketing, in-theater experiences, and related content.
                </p>
                <p>
                    By using our services, you agree to comply with all applicable laws, theater policies, and respectful conduct during screenings.
                </p>
                <p>
                    Any violation of these terms may result in removal from the theater and suspension of access to digital services.
                </p>

            </div>
        </div>
    );
};

export default GeneralTerms;
