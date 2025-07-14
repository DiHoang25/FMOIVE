import { useState, useRef, useEffect, Fragment } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  const isShowtimePage = location.pathname === '/showtimes';
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = [
    { label: 'Home', href: '/', icon: <FaHome className="w-4 h-4" /> },
    { label: 'Showtimes', href: '/showtimes' },
    { label: 'Movies', dropdown: [{ label: 'Movie Search', href: '/moviesearch' }] },
    { label: 'Promotions', href: '/promotions' },
    { label: 'Contact', href: '/contact' },
    {
      label: 'Member',
      dropdown: [
        { label: 'Account', href: '/viewaccount' },
        { label: 'Customer benefits', href: '/customer-benefits' },
      ],
    },
  ];

  return (
    <Fragment>
      <div className={`fixed top-[60px] left-0 right-0 ${isShowtimePage ? 'z-40' : 'z-20'} bg-white shadow`}>
        <div className="flex items-center justify-between px-4 py-2 md:px-8">
          <div className="md:hidden">
            <Menu className="w-6 h-6 cursor-pointer" onClick={() => setIsMobileOpen(!isMobileOpen)} />
          </div>

          <div className="hidden md:flex justify-center space-x-6 w-full">
            {links.map((item, idx) =>
              item.dropdown ? (
                <DropdownItem key={idx} label={item.label} items={item.dropdown} isShowtimePage={isShowtimePage} />
              ) : (
                <NavItem key={idx} label={item.label} icon={item.icon} link={item.href} />
              )
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileOpen && (
          <div className="md:hidden px-4 pb-4">
            {links.map((item, idx) =>
              item.dropdown ? (
                <div key={idx} className="mt-2">
                  <span className="font-semibold">{item.label}</span>
                  <ul className="ml-2 space-y-1">
                    {item.dropdown.map((child, cIdx) => (
                      <li key={cIdx}>
                        <Link to={child.href} className="text-sm text-blue-600 hover:underline">
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  key={idx}
                  to={item.href}
                  className="block mt-2 text-sm text-Black-600 hover:underline"
                >
                  {item.label}
                </Link>
              )
            )}
          </div>
        )}
      </div>

      <div className="h-[80px]" />
    </Fragment>
  );
};

const NavItem = ({ label, link = '#', icon = null }) => (
  <Link to={link} className="flex items-center space-x-1 hover:text-blue-500 text-black font-medium">
    {icon && icon}
    <span>{label}</span>
  </Link>
);

const DropdownItem = ({ label, items, isShowtimePage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500 text-black font-medium">
        <span>{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-white text-black shadow-lg rounded-md border ${isShowtimePage ? 'z-50' : 'z-30'} animate-fade-in`}>
          <ul className="py-2">
            {items.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 text-sm"
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
