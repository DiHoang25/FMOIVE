import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UsersDashboard from './pages/Users/UsersDashboard';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import LoginPage from './pages/LoginPage';
import NotificationBar from './components/notificationbar';
import Navbar from './components/navbar';
import Footer from './components/footer';
import HomePage from './pages/Homepage/HomePage';
function App() {
  return (
    <BrowserRouter>
    <NotificationBar />
    <div className="pt-[60px]">
      <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/Users" element={<UsersDashboard />} />
            <Route path="/Employee" element={<EmployeeDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* Add other routes here */}
          </Routes>
    </div>
    <Footer />
    </BrowserRouter>
  );
};

export default App;