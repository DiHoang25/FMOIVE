import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { FaHome } from 'react-icons/fa'

const Navbar = () => {
  const location = useLocation();
  const isShowtimePage = location.pathname === '/showtimes';

  return (
    <div className={`fixed top-[60px] left-0 right-0 ${isShowtimePage ? 'z-40' : 'z-20'} flex items-center justify-center bg-white shadow px-4 py-2`}>
  <div className="flex space-x-6">
    <NavItem label="Home" icon={<FaHome className="w-4 h-4 text-black" />} showArrow={false} link="/" />
    <NavItem label="Showtimes" showArrow={false} link="/showtimes" />
    <DropdownItem
      label="Movies"
      items={[
        { label: "Movie Search", href: "/moviesearch" },
        { label: "Movie News", href: "/movienews" },
      ]}
          isShowtimePage={isShowtimePage}
    />
    <NavItem label="Promotions" showArrow={false} link="/promotions" />
    <NavItem label="Contact" showArrow={false} link="/contact" />
    <DropdownItem
      label="Member"
      items={[
        { label: "Account", href: "/viewaccount" },
        { label: "Customer benefits", href: "/customer-benefits" },
      ]}
          isShowtimePage={isShowtimePage}
    />
  </div>
</div>
  )
}

const NavItem = ({ label, showArrow = true, link = "#", icon = null }) => (
  <Link
    to={link}
    className="flex items-center space-x-1 cursor-pointer hover:text-blue-500 select-none transition-colors duration-200"
  >
    {icon && icon}
    <span className="text-black font-medium">{label}</span>
    {showArrow && <ChevronDown className="w-3 h-3" />}
  </Link>
)

const DropdownItem = ({ label, items, isShowtimePage }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div
      className="relative inline-block text-left"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center space-x-1 cursor-pointer hover:text-blue-500 select-none transition-colors duration-200">
        <span className="text-black font-medium">{label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-white text-black shadow-lg rounded-md border border-gray-200 ${isShowtimePage ? 'z-50' : 'z-30'} animate-in fade-in-0 zoom-in-95 duration-200`}>
          <ul className="py-2">
            {items.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.href}
                  className="block px-4 py-2 hover:bg-blue-50 hover:text-blue-600 text-sm transition-colors duration-150"
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
  )
}

export default Navbar

