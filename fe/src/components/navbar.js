import React, { useState, useRef, useEffect } from 'react';
import downArrow from '../assets/down-arrow.png';
import searchIcon from '../assets/search-icon.png';

const Navbar = () => {
  return (
    <div className="flex items-center justify-between bg-white shadow px-4 py-2">
      <div className="flex items-center border rounded px-2 py-1 shadow">
        <input
          type="text"
          placeholder="Search..."
          className="outline-none px-2 w-40"
        />
        <img src={searchIcon} alt="Search" className="w-4 h-4 ml-1" />
      </div>

      <div className="flex space-x-6">
        <NavItem label="Home Page" />
        <NavItem label="Showtimes" />
        <DropdownItem
          label="Movies"
          items={[
            { label: 'Movie Search', href: '/movie-search' },
            { label: 'Movie News', href: '/movie-news' },
          ]}
        />
        <NavItem label="Contact" />
        <DropdownItem
          label="Member"
          items={[
            { label: 'Account', href: '/account' },
            { label: 'Authority', href: '/authority' },
          ]}
        />
      </div>
    </div>
  );
};

const NavItem = ({ label }) => (
  <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500 select-none">
    <span className="text-black font-medium">{label}</span>
    <img src={downArrow} alt="down-arrow" className="w-3 h-3" />
  </div>
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
                  <a
                    href={item.href}
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

export default Navbar;
