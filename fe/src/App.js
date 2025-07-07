import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import RequireRole from './components/RequireRole';

import { Provider } from 'react-redux';
import { store } from './redux/store'; // Adjust the path to your store file

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
import AdminProfile from './pages/Admin/AdminProfile';
import MovieDetails from './pages/Movie/MovieDetails';
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
import TicketDetail from './pages/Users/TicketDetail';
import PaymentPage from './pages/Users/PaymentMethod';
import PaymentStatusPage from './pages/Users/PaymentStatus'; 
import CounterShowtimesPage from './pages/Employee/CounterShowtimePage';
import CounterSeatSelectionPage from './pages/Employee/CounterSelectionSeat';
import CounterComboPage from './pages/Employee/CounterCombo';
import CounterConfirmBooking from './pages/Employee/CounterConfirm';
import PaymentCounter from './pages/Employee/CounterPayment';
import PaymentSuccess from './pages/Employee/PaymentSuccessfull';
import PromotionsPage from './pages/Promotions/PromotionsPage';
import CustomerBenefits from './pages/Users/CustomerBenefits';
import ScrollToTop from './components/ScrollToTop';
import CinemaRooms from './pages/Admin/CinemaRooms';
import CinemaRoomDetail from './pages/Admin/CinemaRoomDetail';
import GeneralTerms from './pages/Policies/GeneralTerms';
import PaymentPolicy from './pages/Policies/PaymentPolicy';
import DeliveryPolicy from './pages/Policies/DeliveryPolicy';
import InformationSecurity from './pages/Policies/InformationSecurity';
import InspectionReturns from './pages/Policies/InspectionReturns';
import ContactPage from './pages/Contact/ContactPage';
import CounterBookingList from './pages/Employee/CounterBookingList';
import ChangePassword from './pages/Users/ChangePassword';
import CounterGetTicket from './pages/Employee/CounterGetTicket';
import EditMovie from './pages/Admin/EditMovie';
import AddCinemaRoom from './pages/Admin/AddCinemaRoom';
import AddPromotion from './pages/Admin/AddPromotion';
import EditPromotion from './pages/Admin/EditPromotion';
import { AuthProvider } from './contexts/AuthContext';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import ViewEmployees from './pages/Admin/ViewEmployee';
import AddEmployee from './pages/Admin/AddEmployee';
import AddCombo from './pages/Employee/AddCombo';
import ViewCombo from './pages/Employee/ViewCombo';
import EditCombo from './pages/Employee/EditCombo';
import MovieNewsDetails from './pages/Movie/MovieNewsDetails';
import AddMovieNews from './pages/Admin/AddMovieNews';
import MovieNewsList from './pages/Admin/MovieNewsList'
import EditMovieNews from './pages/Admin/EditMovieNews';
import AddProduct from './pages/Employee/AddProduct';
import ViewProduct from './pages/Employee/ViewProduct';
import EditProduct from './pages/Employee/EditProduct';


function AppContent() {
  const location = useLocation();

  const hideNavbarFooter =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/employee') ||
    location.pathname.startsWith('/login') ||
    location.pathname.startsWith('/register') ||
    location.pathname.startsWith('/reset-password') ||
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/new-password');

  const hideLayout =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/employee');

  return (
    <>
      {!hideLayout && <NotificationBar />}
      <div className={!hideLayout ? 'pt-[0px]' : ''}>
        {!hideNavbarFooter && <Navbar />}
        <ScrollToTop />
        <Routes>
           {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/new-password" element={<NewPasswordPage />} />
          <Route path="/moviedetails/:id" element={<MovieDetails />} />
          
          <Route path="/moviesearch" element={<MovieSearch />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/terms" element={<GeneralTerms />} />
          <Route path="/payment-policy" element={<PaymentPolicy />} />
          <Route path="/delivery-policy" element={<DeliveryPolicy />} />
          <Route path="/information-security" element={<InformationSecurity />} />
          <Route path="/returns-refunds" element={<InspectionReturns />} />
          <Route path="/movienews/:slug" element={<MovieNewsDetails />} />


         
          
          <Route path="/customer-benefits" element={<CustomerBenefits />} />         
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/terms" element={<GeneralTerms />} />
          <Route path="/payment-policy" element={<PaymentPolicy />} />
          <Route path="/delivery-policy" element={<DeliveryPolicy />} />
          <Route path="/information-security" element={<InformationSecurity />} />
          <Route path="/returns-refunds" element={<InspectionReturns />} />
          <Route path="/moviesearch" element={<MovieSearch />} />
          
          {/* Customer */}
          <Route path="/Users" element={<RequireRole allowedRoles={['customer']}><UsersDashboard /></RequireRole>} />
          <Route path="/viewbookedticket" element={<RequireRole allowedRoles={['customer']}><ViewBookedTickets /></RequireRole>} />
          <Route path="/viewscorehistory" element={<RequireRole allowedRoles={['customer']}><ViewScoreHistory /></RequireRole>} />
          <Route path="/viewaccount" element={<RequireRole allowedRoles={['customer']}><ViewAccount /></RequireRole>} />
          <Route path="/editaccount" element={<RequireRole allowedRoles={['customer']}><EditAccount /></RequireRole>} />
          <Route path="/changepassword" element={<RequireRole allowedRoles={['customer']}><ChangePassword /></RequireRole>} />
          <Route path="/customer-benefits" element={<RequireRole allowedRoles={['customer']}><CustomerBenefits /></RequireRole>} />

          {/* Booking */}
          <Route path="/showtimes" element={<ShowtimePage />} />
          <Route path="/select-seats" element={<SeatSelectionPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/combo-selection" element={<ComboSelection />} />
          <Route path="/confirm-booking" element={<ConfirmBooking />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-status" element={<PaymentStatusPage />} />
          <Route path="/ticket-detail" element={<TicketDetail />} />

          {/* Admin */}
          <Route path="/admin" element={<RequireRole allowedRoles={['admin']}><AdminDashboard /></RequireRole>} />
          <Route path="/admin/view-members" element={<RequireRole allowedRoles={['admin']}><ViewMembers /></RequireRole>} />
          <Route path="/admin/view-employees" element={<RequireRole allowedRoles={['admin']}><ViewEmployees /></RequireRole>} />
          <Route path="/admin/admin-profile" element={<RequireRole allowedRoles={['admin']}><AdminProfile /></RequireRole>} />
          <Route path="/admin/add-employee" element={<RequireRole allowedRoles={['admin']}><AddEmployee /></RequireRole>} />
          <Route path="/admin/add-movie" element={<RequireRole allowedRoles={['admin']}><AddMovie /></RequireRole>} />
          <Route path="/admin/movie-list" element={<RequireRole allowedRoles={['admin']}><MovieList /></RequireRole>} />
          <Route path="/admin/movie-list/edit-movie/:id" element={<RequireRole allowedRoles={['admin']}><EditMovie /></RequireRole>} />
          <Route path="/admin/booking-list" element={<RequireRole allowedRoles={['admin']}><BookingList /></RequireRole>} />
          <Route path="/admin/promotions" element={<RequireRole allowedRoles={['admin']}><Promotions /></RequireRole>} />
          <Route path="/admin/add-promotion" element={<RequireRole allowedRoles={['admin']}><AddPromotion /></RequireRole>} />
          <Route path="/admin/promotions/edit-promotion/:id" element={<RequireRole allowedRoles={['admin']}><EditPromotion /></RequireRole>} />
          <Route path="/admin/cinema-rooms" element={<RequireRole allowedRoles={['admin']}><CinemaRooms /></RequireRole>} />
          <Route path="/admin/room/:roomId" element={<RequireRole allowedRoles={['admin']}><CinemaRoomDetail /></RequireRole>} />
          <Route path="/admin/cinema-rooms/add-new-cinema-room" element={<RequireRole allowedRoles={['admin']}><AddCinemaRoom /></RequireRole>} />
          <Route path="/admin/add-movienews" element={<RequireRole allowedRoles={['admin']}><AddMovieNews /></RequireRole>} />
          <Route path="/admin/movienews-list" element={<RequireRole allowedRoles={['admin']}><MovieNewsList /></RequireRole>} />
          <Route path="/admin/edit-movienews/:id" element={<RequireRole allowedRoles={['admin']}><EditMovieNews /></RequireRole>} />
          {/* Employee */}
          <Route path="/employee" element={<RequireRole allowedRoles={['employee']}><EmployeeDashboard /></RequireRole>} />
          <Route path="/employee/employee-profile" element={<RequireRole allowedRoles={['employee']}><EmployeeProfile /></RequireRole>} />
          <Route path="/employee/members-list" element={<RequireRole allowedRoles={['employee']}><ViewMembersList /></RequireRole>} />
          <Route path="/employee/counter-showtimes" element={<RequireRole allowedRoles={['employee']}><CounterShowtimesPage /></RequireRole>} />
          <Route path="/employee/counter-seat" element={<RequireRole allowedRoles={['employee']}><CounterSeatSelectionPage /></RequireRole>} />
          <Route path="/employee/counter-combo" element={<RequireRole allowedRoles={['employee']}><CounterComboPage /></RequireRole>} />
          <Route path="/employee/counter-confirm" element={<RequireRole allowedRoles={['employee']}><CounterConfirmBooking /></RequireRole>} />
          <Route path="/employee/counter-payment" element={<RequireRole allowedRoles={['employee']}><PaymentCounter /></RequireRole>} />
          <Route path="/employee/counter-payment-success" element={<RequireRole allowedRoles={['employee']}><PaymentSuccess /></RequireRole>} />
          <Route path="/employee/counter-booking-list" element={<RequireRole allowedRoles={['employee']}><CounterBookingList /></RequireRole>} />
          <Route path="/employee/counter-get-ticket" element={<RequireRole allowedRoles={['employee']}><CounterGetTicket /></RequireRole>} />
          <Route path="/employee/add-combo" element={<RequireRole allowedRoles={['employee']}><AddCombo /></RequireRole>} />
          <Route path="/employee/view-combo" element={<RequireRole allowedRoles={['employee']}><ViewCombo /></RequireRole>} />
          <Route path="/employee/view-combo/edit-combo/:id" element={<RequireRole allowedRoles={['employee']}><EditCombo /></RequireRole>} />
          <Route path="/employee/add-product" element={<RequireRole allowedRoles={['employee']}><AddProduct /></RequireRole>} />
          <Route path="/employee/view-product" element={<RequireRole allowedRoles={['employee']}><ViewProduct /></RequireRole>} />
          <Route path="/employee/view-product/edit-product/:id" element={<RequireRole allowedRoles={['employee']}><EditProduct /></RequireRole>} />

          {/* Not Found Page - Phải là route cuối cùng */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        {!hideNavbarFooter && <Footer />}
      </div>
    </>
  );
}
function App() {
  return (
    <Provider store={store}> {/* Wrap your entire application with the Redux Provider */}
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
