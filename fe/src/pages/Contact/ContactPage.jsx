import React, { useState } from 'react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ success: false, message: '' });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate API call
      setTimeout(() => {
        setSubmitStatus({
          success: true,
          message: 'Thank you for your message! We will get back to you shortly.',
        });
        
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus({ success: false, message: '' });
        }, 5000);
      }, 1000);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gray-900 py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent opacity-80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">Contact Us</h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-gray-300">
            Have questions or feedback? We'd love to hear from you. Our team is always ready to help.
          </p>
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Address */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Our Location</h3>
            <p className="text-gray-300">
              F-Town 1 Building, High-tech Park, 
              <br />
              Tan Phu Ward Thu Duc City,
              <br />
              Ho Chi Minh City, Vietnam
            </p>
          </div>

          {/* Email */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Us</h3>
            <p className="text-gray-300">
              Support: <a href="mailto:support@fat.edu.vn" className="text-red-500 hover:underline">support@fat.edu.vn</a>
              <br />
              General: <a href="mailto:info@fat.edu.vn" className="text-red-500 hover:underline">info@fat.edu.vn</a>
            </p>
          </div>

          {/* Phone */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <div className="bg-red-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Call Us</h3>
            <p className="text-gray-300">
              Hotline: 1900 1722
              <br />
              Customer Service: +84 28 3456 7890
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-center">Send Us a Message</h2>
          
          {/* Success Message */}
          {submitStatus.success && (
            <div className="bg-green-600 text-white p-4 rounded mb-6 text-center">
              {submitStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-gray-700 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                  placeholder="Your name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-gray-700 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                  placeholder="Your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
            
            {/* Subject Field */}
            <div className="mb-6">
              <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full bg-gray-700 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                placeholder="Subject of your message"
              />
              {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
            </div>
            
            {/* Message Field */}
            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full bg-gray-700 text-white rounded px-4 py-3 focus:outline-none focus:ring-2 ${errors.message ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                placeholder="Your message"
                rows="6"
              ></textarea>
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>
            
            <div className="text-center">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <div className="w-full h-96 mt-8">
        <iframe
          title="Our Location"
          className="w-full h-full"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.455458069674!2d106.78919287589787!3d10.850929889322552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9c8be3c91!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1715673183916!5m2!1sen!2s"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">What are your operating hours?</h3>
            <p className="text-gray-300">Our cinema is open daily from 9:00 AM to 11:00 PM. Box office and concession stands open 30 minutes before the first show and close 30 minutes after the last show starts.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">How can I get a refund for my tickets?</h3>
            <p className="text-gray-300">Refunds are available for tickets purchased online up to 2 hours before the scheduled showtime. Please contact our customer service with your booking details to process your refund.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Do you offer discounts for students or seniors?</h3>
            <p className="text-gray-300">Yes, we offer special discounts for students, seniors (age 60+), and children under 12. Please bring a valid ID to the box office to receive your discount.</p>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">Can I bring outside food and drinks?</h3>
            <p className="text-gray-300">Outside food and drinks are not allowed in our cinema. We offer a variety of snacks, beverages, and meal options at our concession stands.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;