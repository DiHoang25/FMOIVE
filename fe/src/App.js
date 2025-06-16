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
import MovieSearch from './pages/Movie/MovieSearch'; 
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
import ViewAccount from './pages/Users/ViewAccount';
import EditAccount from './pages/Users/EditAccount';
import BookingList from './pages/Admin/BookingList';
import MovieDetailsSearch from './pages/Movie/MovieDetailsSearch';
import MovieNewsSearch from './pages/Movie/MovieNewsSearch';
import TicketDetail from './pages/Users/TicketDetail';
import PaymentPage from './pages/Users/PaymentMethod';
import PromotionsPage from './pages/Promotions/PromotionsPage';
import CustomerBenefits from './pages/Users/CustomerBenefits';

function AppContent() {
  const location = useLocation();

  
  const hideNavbarFooter =
    location.pathname.startsWith('/admin')
    || location.pathname.startsWith('/employee')
    || location.pathname.startsWith('/login')
    || location.pathname.startsWith('/register')
    || location.pathname.startsWith('/reset-password')
    || location.pathname.startsWith('/forgot-password')
    || location.pathname.startsWith('/new-password');


  const showNavbarForMovieSearch = location.pathname === '/moviesearch';

  return (
    <>
      
      <NotificationBar />
      <div className="pt-[0px]">
        
        {!hideNavbarFooter && !showNavbarForMovieSearch && <Navbar />}
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
          <Route path="/moviesearch" element={<MovieSearch />} />
          <Route path="/admin/add-movie" element={<AddMovie />} />
          <Route path="/admin/movie-list" element={<MovieList />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/viewbookedticket" element={<ViewBookedTickets />} />
          <Route path="/viewscorehistory" element={<ViewScoreHistory />} />
          <Route path='/admin/promotions' element={<Promotions />} />
          <Route path="/viewaccount" element={<ViewAccount />} />
          <Route path="/editaccount" element={<EditAccount />} />
          <Route path="/moviedetailssearch" element={<MovieDetailsSearch />} />
          <Route path="/movienewsssearch" element={<MovieNewsSearch />} />
          <Route path='/admin/booking-list' element={<BookingList />} />
          <Route path="/customer-benefits" element={<CustomerBenefits />} />

        
          <Route path="/showtimes" element={<ShowtimePage />} />
          <Route path="/select-seats" element={<SeatSelectionPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/combo" element={<ComboSelection />} />
          <Route path="/confirm-booking" element={<ConfirmBooking />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/ticket-detail" element={<TicketDetail />} />
          <Route path="/promotions" element={<PromotionsPage />} />
        </Routes>
       
        {!hideNavbarFooter && <Footer />}
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