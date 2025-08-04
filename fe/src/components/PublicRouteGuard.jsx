import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PublicRouteGuard = ({ children }) => {
  const navigate = useNavigate();
  const [allow, setAllow] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentPath = window.location.pathname;

    if (!token) {
      setAllow(true);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const role = decoded.user.role;

      // ✅ Cho phép vào trang register luôn
      if (currentPath === '/register') {
        setAllow(true);
      } else if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'employee') {
        navigate('/employee', { replace: true });
      } else {
        setAllow(true); // Cho phép customer
      }
    } catch (err) {
      localStorage.removeItem('token'); // xóa nếu token lỗi
      setAllow(true);
    } finally {
      setLoading(false);
    }
  }, [navigate]);


  if (loading) return null; // hoặc spinner

  return allow ? children : null;
};

export default PublicRouteGuard;
