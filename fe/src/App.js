import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UsersDashboard from './pages/Users/UsersDashboard';
import EmployeeDashboard from './pages/Employee/EmployeeDashboard';
import LoginPage from './pages/Login/LoginPage';
import NotificationBar from './components/notificationbar';
import Navbar from './components/navbar';
import Footer from './components/footer';
import HomePage from './pages/Homepage/HomePage';
import RegisterPage from './pages/Login/RegisterPage';
import ViewMembers from './pages/Admin/ViewMembers';
import EmployeeList from './pages/Admin/EmployeeList';
import AdminProfile from './pages/Admin/AdminProfile';
import MovieDetails from './pages/Movie/MovieDetails';
import MovieNews from './pages/Movie/MovieNews';
import EmployeeProfile from './pages/Employee/EmployeeProfile';
import ViewMembersList from './pages/Employee/ViewMembersList';

function AppContent() {
  const location = useLocation();
  const hideLayout = location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee');


  return (
    <>
      {!hideLayout && <NotificationBar />}
      <div className={!hideLayout ? 'pt-[60px]' : ''}>
        {!hideLayout && <Navbar />}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Users" element={<UsersDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/view-members" element={<ViewMembers />} />
          <Route path="/admin/view-employees" element={<EmployeeList />} />
          <Route path="/admin/admin-profile" element={<AdminProfile />} />
          <Route path="/employee/members-list" element={<ViewMembersList />} />
          <Route path="/employee/employee-profile" element={<EmployeeProfile />} />
          <Route path="/moviedetails" element={<MovieDetails/>} />
            <Route path="/movienews" element={<MovieNews />} />
        </Routes>
        {!hideLayout && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;