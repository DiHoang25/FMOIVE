import React from 'react';
import { Link } from 'react-router-dom';

function CustomerBenefits() {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-10">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-red-600 mb-8 text-center">Customer Benefits</h1>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-gray-800">
          <div className="mb-8">
            <p className="mb-4">
              At MovieTheater, we are committed to providing our customers with the most enjoyable movie experiences and ensuring their rights are always prioritized. Below are the benefits that customers will receive when using our services:
            </p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Membership Benefits:</h2>
            <ul className="space-y-4 list-disc pl-6">
              <li>
                <strong>Access to exclusive information</strong> about upcoming movies, special screenings, and promotional events.
              </li>
              <li>
                <strong>Priority booking</strong> - members can book tickets up to 7 days in advance before general ticket sales open.
              </li>
              <li>
                <strong>Earn loyalty points</strong> with every purchase that can be redeemed for free tickets, concessions, or exclusive merchandise.
              </li>
              <li>
                <strong>Special birthday offers</strong> - receive a complimentary ticket during your birthday month.
              </li>
              <li>
                <strong>Discounted concessions</strong> - enjoy special member pricing on popcorn, drinks, and other concession items.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Service Guarantees:</h2>
            <ul className="space-y-4 list-disc pl-6">
              <li>
                <strong>Customer support</strong> - dedicated assistance for any questions or issues related to your booking or experience.
              </li>
              <li>
                <strong>Clean and comfortable facilities</strong> - we maintain high standards of cleanliness and comfort in all our theaters.
              </li>
              <li>
                <strong>Technical quality assurance</strong> - we guarantee optimal sound and visual quality for all screenings.
              </li>
              <li>
                <strong>Easy refunds and exchanges</strong> - if you need to change your plans, we offer flexible options for ticket changes.
              </li>
              <li>
                <strong>Safety and security</strong> - we prioritize the safety of all customers and staff with strict security protocols.
              </li>
            </ul>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-red-600 mb-4">Additional Rights:</h2>
            <ul className="space-y-4 list-disc pl-6">
              <li>
                <strong>Expert recommendations</strong> - our staff is trained to help you choose movies based on your preferences and provide honest reviews.
              </li>
              <li>
                <strong>Accurate information</strong> - we guarantee that all information about movies, showtimes, and theater facilities is accurate and up-to-date.
              </li>
              <li>
                <strong>Privacy protection</strong> - we safeguard your personal information and adhere to strict privacy policies.
              </li>
              <li>
                <strong>Inclusive environment</strong> - we are committed to creating a welcoming space for all moviegoers regardless of background.
              </li>
              <li>
                <strong>Feedback channels</strong> - your opinions matter to us, and we provide multiple ways for you to share your experience and suggestions.
              </li>
            </ul>
          </div>

          <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-200">
            <p className="italic">
              MovieTheater is dedicated to continuous improvement of our services based on customer feedback. If you have any questions about your benefits or wish to provide feedback, please contact our customer service team.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Link to="/register" className="inline-block bg-red-600 text-white font-medium py-3 px-6 rounded-md hover:bg-red-700 transition duration-300">
              Become a Member Today
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerBenefits;