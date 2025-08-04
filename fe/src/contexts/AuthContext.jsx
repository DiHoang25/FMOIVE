// src/contexts/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser as setReduxUser, resetBooking } from "../redux/bookingSlice";
import socket, { createSocket } from "../utils/socket"; // ⬅ thêm createSocket
import { message } from "antd";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!authToken);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketInstance, setSocketInstance] = useState(socket); // ⬅ new


  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Hàm logout dùng lại ở nhiều nơi
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("showtimeScrollPosition");
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
    dispatch(setReduxUser(null));
    dispatch(resetBooking());

    console.log("User logged out. All states reset.");
    navigate("/login");
  }, [dispatch, navigate]);

  // Kiểm tra token khi AuthProvider mount
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
          logout(); // Gọi luôn logout
        }
      } catch (err) {
        console.error("Invalid token found in localStorage:", err);
        logout(); // Gọi luôn logout
      }
    } else {
      console.log("No token found in localStorage. User not authenticated.");
      logout(); // Gọi luôn logout
    }

    setLoading(false);
  }, [authToken, dispatch, logout]);

  // Nghe event từ socket để tự động logout khi bị forceLogout
useEffect(() => {
  const handleForceLogout = (data) => {
    console.warn("⚠️ Nhận forceLogout từ server:", data?.message);

    // 🟡 Hiển thị thông báo
    message.warning({
      content: "Your account was logged in from another device. You've been logged out.",
      duration: 5,
    });

    logout();
  };

  socketInstance.on("forceLogout", handleForceLogout);

  return () => {
    socketInstance.off("forceLogout", handleForceLogout);
  };
}, [socketInstance, logout]);



  // Hàm login
const login = (token) => {
  if (!token) {
    console.error("Login failed: Token is undefined or null.");
    return;
  }
  try {
    localStorage.setItem("token", token);
    setAuthToken(token);

    // 👉 Ngắt socket cũ và tạo socket mới với deviceId mới
    socketInstance?.disconnect();
    const newSocket = createSocket(true);
    setSocketInstance(newSocket);

    // 👉 Gửi lại thông tin người dùng (nếu cần)
    const decoded = jwtDecode(token);
    if (decoded?.user) {
      newSocket.emit("register", {
        username: decoded.user.username,
        role: decoded.user.role || "customer",
      });
    }

    // 👉 Lắng nghe forceLogout với socket mới
    newSocket.on("forceLogout", () => {
      console.warn("⚠️ forceLogout từ socket mới");
      logout();
    });

  } catch (error) {
    console.error("Error setting token during login:", error);
  }
};


  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
