import React, { useState, useRef, useEffect } from 'react';
import { initEmailJS, sendContactEmail } from '../../utils/emailService';
const ContactPage = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    success: false,
    error: false,
    message: ''
  });

  
  useEffect(() => {
    initEmailJS();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
        setSubmitStatus({
        loading: true,
        success: false,
        error: false,
        message: 'Sending your message...'
        });
        
      try {
        // Sử dụng utility function để gửi email
        await sendContactEmail(formData, form.current);
          setSubmitStatus({
            loading: false,
            success: true,
            error: false,
            message: 'Thank you for your message! We will get back to you shortly.',
        });
        
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
          });

        setTimeout(() => {
            setSubmitStatus({
              loading: false,
              success: false,
              error: false,
              message: ''
            });
        }, 5000);
      } catch (error) {
        console.error('Failed to send email:', error);
          setSubmitStatus({
            loading: false,
            success: false,
            error: true,
            message: 'Failed to send your message. Please try again later.',
          });
    }
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="relative bg-gray-900 py-8 sm:py-12 md:py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent opacity-80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-2 sm:mb-4">Contact Us</h1>
          <p className="text-base sm:text-lg md:text-xl text-center max-w-3xl mx-auto text-gray-300">
            Have questions or feedback? We'd love to hear from you. Our team is always ready to help.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-center">
            <div className="bg-red-600 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Our Location</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              F-Town 1 Building, High-tech Park, 
              <br />
              Tan Phu Ward Thu Duc City,
              <br />
              Ho Chi Minh City, Vietnam
            </p>
          </div>

          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-center">
            <div className="bg-red-600 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Email Us</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Support: <a href="mailto:fmoivee@gmail.com" className="text-red-500 hover:underline">fmoivee@gmail.com</a>
              <br />
              General: <a href="mailto:fmoivee@gmail.com" className="text-red-500 hover:underline">fmoivee@gmail.com</a>
            </p>
          </div>

          <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg text-center">
            <div className="bg-red-600 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Call Us</h3>
            <p className="text-gray-300 text-sm sm:text-base">
              Hotline: 1900 1722
              <br />
              Customer Service: +84 28 3456 7890
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto bg-gray-800 p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-center">Send Us a Message</h2>
          
          {submitStatus.loading && (
            <div className="bg-blue-600 text-white p-3 sm:p-4 rounded mb-4 sm:mb-6 text-center">
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm sm:text-base">{submitStatus.message}</span>
              </div>
            </div>
          )}

          {submitStatus.success && (
            <div className="bg-green-600 text-white p-3 sm:p-4 rounded mb-4 sm:mb-6 text-center text-sm sm:text-base">
              {submitStatus.message}
              </div>
          )}
              
          {submitStatus.error && (
            <div className="bg-red-600 text-white p-3 sm:p-4 rounded mb-4 sm:mb-6 text-center text-sm sm:text-base">
              {submitStatus.message}
            </div>
          )}

          <form ref={form} onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div>
                <label htmlFor="name" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                onChange={handleChange}
                  className={`w-full bg-gray-700 text-white rounded px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                  placeholder="Your name"
              />
                {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
            </div>
            
              <div>
                <label htmlFor="email" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                onChange={handleChange}
                  className={`w-full bg-gray-700 text-white rounded px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 text-sm ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                  placeholder="Your email"
                />
                {errors.email && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.email}</p>}
            </div>
            </div>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="subject" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full bg-gray-700 text-white rounded px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 text-sm ${errors.subject ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                placeholder="Subject of your message"
              />
              {errors.subject && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.subject}</p>}
        </div>

            <div className="mb-4 sm:mb-6">
              <label htmlFor="message" className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full bg-gray-700 text-white rounded px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 text-sm ${errors.message ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                placeholder="Your message"
                rows="4 sm:rows-6"
              ></textarea>
              {errors.message && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.message}</p>}
      </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                disabled={submitStatus.loading}
              >
                {submitStatus.loading ? 'Sending...' : 'Send Message'}
              </button>
      </div>
          </form>
          </div>
          </div>
          
      <div className="w-full h-64 sm:h-80 md:h-96 mt-6 sm:mt-8">
        <iframe
          title="Our Location"
          className="w-full h-full"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.455458069674!2d106.78919287589787!3d10.850929889322552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317527587e9ad5bf%3A0xafa66f9c8be3c91!2sFPT%20University%20HCMC!5e0!3m2!1sen!2s!4v1715673183916!5m2!1sen!2s"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
          </div>
          
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 md:mb-12 text-center">Frequently Asked Questions</h2>

        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">What are your operating hours?</h3>
            <p className="text-gray-300 text-sm sm:text-base">Our cinema is open daily from 9:00 AM to 11:00 PM. Box office and concession stands open 30 minutes before the first show and close 30 minutes after the last show starts.</p>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">How can I get a refund for my tickets?</h3>
            <p className="text-gray-300 text-sm sm:text-base">Refunds are available for tickets purchased online up to 2 hours before the scheduled showtime. Please contact our customer service with your booking details to process your refund.</p>
        </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Do you offer discounts for students or seniors?</h3>
            <p className="text-gray-300 text-sm sm:text-base">Yes, we offer special discounts for students, seniors (age 60+), and children under 12. Please bring a valid ID to the box office to receive your discount.</p>
      </div>

          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">Can I bring outside food and drinks?</h3>
            <p className="text-gray-300 text-sm sm:text-base">Outside food and drinks are not allowed in our cinema. We offer a variety of snacks, beverages, and meal options at our concession stands.</p>
    </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;