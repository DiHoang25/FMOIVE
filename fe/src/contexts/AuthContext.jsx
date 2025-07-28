// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from 'react-redux';
import { setUser as setReduxUser, resetBooking } from '../redux/bookingSlice';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  // Sửa lỗi: chỉ dispatch là dependency cần thiết
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("showtimeScrollPosition");
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
    dispatch(setReduxUser(null));
    dispatch(resetBooking());
    console.log("User logged out. All states reset.");
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);

    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);

        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser(decoded.user);
          dispatch(setReduxUser(decoded.user));
          console.log("Token is valid. User data set:", decoded.user);
        } else {
          console.warn("Token expired. Logging out automatically.");
          // Inline logout logic để tránh circular dependency
          localStorage.removeItem("token");
          sessionStorage.removeItem("showtimeScrollPosition");
          setAuthToken(null);
          setIsAuthenticated(false);
          setUser(null);
          dispatch(setReduxUser(null));
          dispatch(resetBooking());
        }
      } catch (err) {
        console.error("Invalid token found in localStorage:", err);
        // Inline logout logic
        localStorage.removeItem("token");
        sessionStorage.removeItem("showtimeScrollPosition");
        setAuthToken(null);
        setIsAuthenticated(false);
        setUser(null);
        dispatch(setReduxUser(null));
        dispatch(resetBooking());
      }
    } else {
      console.log("No token found in localStorage. User not authenticated.");
      setIsAuthenticated(false);
      setUser(null);
      dispatch(setReduxUser(null));
      dispatch(resetBooking());
    }

    setLoading(false);
  }, [authToken, dispatch]); // Sửa lỗi: loại bỏ logout khỏi dependencies

  const login = (token) => {
    if (!token) {
      console.error("Login failed: Token is undefined or null.");
      return;
    }
    try {
      localStorage.setItem("token", token);
      setAuthToken(token);
      // message.success("Login successful!"); // Nếu bạn dùng Ant Design
    } catch (error) {
      console.error("Error setting token during login:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);