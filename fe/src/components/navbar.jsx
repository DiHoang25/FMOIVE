import React, { useState, useRef, useEffect } from 'react';
import downArrow from '../assets/down-arrow.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className="flex items-center justify-center bg-white shadow px-4 py-2">
      
      <div className="flex space-x-6">
        <NavItem label="Home Page" showArrow={false} link="/" />
        <NavItem label="Showtimes" showArrow={false} link="/showtimes" />
        <DropdownItem
          label="Movies"
          items={[
            { label: 'Movie Search', href: '/moviesearch' },
            { label: 'Movie News', href: '/movienews' },
          ]}
        />
        <NavItem label="Promotions" showArrow={false} link="/promotions" />
        <NavItem label="Contact" showArrow={false} link="/contact" />
        <DropdownItem
          label="Member"
          items={[
            { label: 'Account', href: '/viewaccount' },
            { label: 'Customer benefits', href: '/customer-benefits' },
          ]}
        />
      </div>
    </div>
  );
};

const NavItem = ({ label, showArrow = true, link = "#" }) => (
  <Link to={link} className="flex items-center space-x-1 cursor-pointer hover:text-blue-500 select-none">
    <span className="text-black font-medium">{label}</span>
    {showArrow && <img src={downArrow} alt="down-arrow" className="w-3 h-3" />}
  </Link>
);

const DropdownItem = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-1 cursor-pointer hover:text-blue-500 select-none focus:outline-none"
      >
        <span className="text-black font-medium">{label}</span>
        <img src={downArrow} alt="arrow" className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-white text-black shadow-md rounded z-50">
          <ul className="py-2">
            {items.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className="block px-4 py-2 hover:bg-gray-100 text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;