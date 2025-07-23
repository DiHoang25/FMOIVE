import { useState, useRef, useEffect, Fragment } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import UserNotification from './UserNotification';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isShowtimePage = location.pathname === '/showtimes';
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const scrollToSection = (sectionId) => {

    if (location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {

      navigate(`/#${sectionId}`);
    }
  };


  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location]);

  const links = [
    { label: 'Home', href: '/', icon: <FaHome className="w-4 h-4" /> },
    { label: 'Showtimes', href: '/showtimes' },
    {
      label: 'Movies',
      dropdown: [
        { label: 'Now Showing', onClick: () => scrollToSection('now-showing') },
        { label: 'Coming Soon', onClick: () => scrollToSection('coming-soon') },
        { label: 'Hot Movies', onClick: () => scrollToSection('hot-movies') },
        { label: 'Movie News', onClick: () => scrollToSection('movie-news') },
        { label: 'Movie Search', href: '/moviesearch' }
      ]
    },
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


        {isMobileOpen && (
          <div className="md:hidden px-4 pb-4">
            {links.map((item, idx) =>
              item.dropdown ? (
                <div key={idx} className="mt-2">
                  <span>{item.label}</span>
                  <ul className="ml-2 space-y-1">
                    {item.dropdown.map((child, cIdx) => (
                      <li key={cIdx}>
                        {child.href ? (
                          <Link to={child.href} className="text-sm hover:underline" style={{ color: '#1A1A1A' }}>
                            &gt; {child.label}
                          </Link>
                        ) : (
                          <button
                            onClick={child.onClick}
                            className="text-sm hover:underline text-left"
                            style={{ color: '#1A1A1A' }}
                          >
                            &gt; {child.label}
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Link
                  key={idx}
                  to={item.href}
                  className="block mt-2 text-Black-600 hover:underline"
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
<Link
  to={link}
  className="flex items-center space-x-1 text-black font-medium hover:text-red-700 transition-colors duration-200"
>
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
<div className="flex items-center space-x-1 cursor-pointer text-black font-medium hover:text-red-700 transition-colors duration-200">
  <span>{label}</span>
  <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
</div>


      {isOpen && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-white text-black shadow-lg rounded-md border ${isShowtimePage ? 'z-50' : 'z-30'} animate-fade-in`}>
          <ul className="py-2">
            {items.map((item, index) => (
              <li key={index}>
                {item.href ? (
                  <Link
                    to={item.href}
                    className="block px-4 py-2 hover:bg-red-600 hover:text-white text-sm transition-colors duration-200 rounded"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>

                ) : (
                  <button
                    onClick={() => {
                      item.onClick();
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-red-600 hover:text-white text-sm transition-colors duration-200 rounded"
                  >
                    {item.label}
                  </button>

                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;

