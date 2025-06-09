import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UsersDashboard from './pages/Users/UsersDashboard';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <BrowserRouter>

          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/Users" element={<UsersDashboard />} />
            <Route path="/Employee" element={<EmployeeDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            {/* Add other routes here */}
          </Routes>
    </BrowserRouter>
  );
}

export default App;