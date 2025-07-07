// src/components/PublicRouteGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PublicRouteGuard = ({ children }) => {
  const navigate = useNavigate();
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAllow(true); // Guest => được vào
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const role = decoded.user.role;

      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (role === 'employee') {
        navigate('/employee', { replace: true });
      } else {
        setAllow(true); // customer
      }
    } catch (err) {
      setAllow(true); // token lỗi → cho vào như guest
    }
  }, [navigate]);

  return allow ? children : null;
};

export default PublicRouteGuard;
