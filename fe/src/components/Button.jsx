import React from 'react';

const Button = ({ children, className = '', variant = 'default', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  
  const variants = {
    default: 'bg-gray-800 text-white hover:bg-gray-700',
    primary: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100'
  };

  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;