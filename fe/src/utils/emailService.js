import emailjs from '@emailjs/browser';

const CONFIG = {
  SERVICE_ID: 'service_ofa3rd7', 
  USER_TEMPLATE_ID: 'template_5kqqjyo', 
  ADMIN_TEMPLATE_ID: 'template_2gz5dja', 
  PUBLIC_KEY: 'eEPLZySEux1A1Zaa3',
  ADMIN_EMAIL: 'fmoivee@gmail.com' 
};

export const initEmailJS = () => {
  emailjs.init(CONFIG.PUBLIC_KEY);
  console.log('EmailJS initialized with public key:', CONFIG.PUBLIC_KEY);
};

/**
 * Gửi email liên hệ
 * @param {Object} formData - Dữ liệu form (name, email, subject, message)
 * @param {HTMLFormElement} formElement - Phần tử form HTML
 * @returns {Promise} - Kết quả gửi email
 */
export const sendContactEmail = async (formData, formElement) => {
  try {
    console.log('Sending contact email with data:', formData);
    
    // Kiểm tra xem tất cả các trường bắt buộc có được điền không
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      throw new Error('Please fill in all required fields');
    }

    // 1. Gửi email phản hồi tự động cho người dùng
    console.log('Sending user confirmation email with template:', CONFIG.USER_TEMPLATE_ID);
    const userResponse = await emailjs.send(
      CONFIG.SERVICE_ID,
      CONFIG.USER_TEMPLATE_ID,
      {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        reply_to: CONFIG.ADMIN_EMAIL // Thiết lập reply-to là email admin
      },
      CONFIG.PUBLIC_KEY
    );
    
    console.log('User email sent successfully:', userResponse);
    
    // 2. Gửi email thông báo đơn giản cho admin
    console.log('Sending admin notification email with template:', CONFIG.ADMIN_TEMPLATE_ID);
    const adminParams = {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      to_name: 'Admin',
      to_email: CONFIG.ADMIN_EMAIL
    };
    
    console.log('Admin email parameters:', adminParams);
    
    const adminResponse = await emailjs.send(
      CONFIG.SERVICE_ID,
      CONFIG.ADMIN_TEMPLATE_ID,
      adminParams,
      CONFIG.PUBLIC_KEY
    );
    
    console.log('Admin email sent successfully:', adminResponse);
    return userResponse;
  } catch (error) {
    console.error('Email sending failed. Full error:', error);
    if (error.text) {
      console.error('Error text:', error.text);
    }
    throw error;
  }
};