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
import AddMovie from './pages/Admin/AddMovie';
import MovieList from './pages/Admin/MovieList';
import ForgotPasswordPage from './pages/Login/ForgotPasswordPage';
import ResetPasswordPage from './pages/Login/ResetPasswordPage';
import NewPasswordPage from './pages/Login/NewPasswordPage';
import ShowtimePage from './pages/Users/ShowtimePage';
import SeatSelectionPage from './pages/Users/SeatSelectionPage';
import ComboSelection from './pages/Users/ComboSelection';
import BookingConfirmationPage from './pages/Users/BookingConfirmationPage';
import ConfirmBooking from './pages/Users/ConfirmBooking';
import ViewBookedTickets from './pages/Users/ViewsBookedTicket';
import ViewScoreHistory from './pages/Users/ScoreHistory';
import Promotions from './pages/Admin/Promotions';

function AppContent() {
  const location = useLocation();
  const hideLayout = location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee');


  return (
    <>
      {!hideLayout && <NotificationBar />}
      <div className={!hideLayout ? 'pt-[1px]' : ''}>
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
          <Route path="/moviedetails" element={<MovieDetails />} />
          <Route path="/movienews" element={<MovieNews />} />
<Route path="/admin/add-movie" element={<AddMovie />} />
          <Route path="/admin/movie-list" element={<MovieList />} />
          <Route path="/moviedetails" element={<MovieDetails />} />
          <Route path="/movienews" element={<MovieNews />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
            <Route path="/movienews" element={<MovieNews />} />
          <Route path="/viewbookedticket" element={<ViewBookedTickets />} />
          <Route path="/viewscorehistory" element={<ViewScoreHistory />} />
          <Route path="/movienews" element={<MovieNews />} />
          <Route path='/admin/promotions' element={<Promotions />} />


          {/* Movie Showtime and Ticket Route*/}
          <Route path="/showtimes" element={<ShowtimePage />} />
          <Route path="/select-seats" element={<SeatSelectionPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/select-seats" element={<SeatSelectionPage />} />
          <Route path="/combo" element={<ComboSelection />} />
          <Route path="/confirm-booking" element={<ConfirmBooking />} />



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