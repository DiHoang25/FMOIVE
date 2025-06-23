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
// import MovieDetailsSearch from './pages/Movie/MovieDetailsSearch';
// import MovieNewsSearch from './pages/Movie/MovieNewsSearch';
import TicketDetail from './pages/Users/TicketDetail';
import PaymentPage from './pages/Users/PaymentMethod';
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
  const hideLayout = location.pathname.startsWith('/admin') || location.pathname.startsWith('/employee');

  return (
    <>
      
      {!hideLayout && <NotificationBar />}
      <div className={!hideLayout ? 'pt-[0px]' : ''}>
        
        
      {!hideNavbarFooter && <Navbar />}
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/Users" element={<UsersDashboard />} />
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/view-members" element={<ViewMembers />} />
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
          {/* <Route path="/moviedetailssearch" element={<MovieDetailsSearch />} />
          <Route path="/movienewsssearch" element={<MovieNewsSearch />} /> */}
          <Route path='/admin/booking-list' element={<BookingList />} />
          <Route path="/customer-benefits" element={<CustomerBenefits />} />
          <Route path="/admin/cinema-rooms" element={<CinemaRooms />} />
          <Route path="/admin/room-detail/:roomId" element={<CinemaRoomDetail />} />
          <Route path="/admin/movie-list/edit-movie/:movieId" element={<EditMovie />} />
          <Route path='/admin/cinema-rooms/add-new-cinema-room' element={<AddCinemaRoom />} />
          <Route path='/admin/add-promotion' element={<AddPromotion />} />
          <Route path='/admin/promotions/edit-promotion/:promotionId' element={<EditPromotion />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/changepassword" element={<ChangePassword />} />
          
         

        
          <Route path="/showtimes" element={<ShowtimePage />} />
          <Route path="/select-seats" element={<SeatSelectionPage />} />
          <Route path="/booking-confirmation" element={<BookingConfirmationPage />} />
          <Route path="/combo" element={<ComboSelection />} />
          <Route path="/confirm-booking" element={<ConfirmBooking />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/ticket-detail" element={<TicketDetail />} />

          { /* Counter(Employee) Routes */}
          <Route path="/employee/counter-showtimes" element={<CounterShowtimesPage />} />
          <Route path="/employee/counter-seat" element={<CounterSeatSelectionPage />} />
          <Route path="/employee/counter-combo"   element={<CounterComboPage />} />
          <Route path="/employee/counter-confirm" element={<CounterConfirmBooking />} />
          <Route path="/employee/counter-payment" element={<PaymentCounter />} />
          <Route path="/employee/counter-payment-success" element={<PaymentSuccess />} />
          <Route path="/employee/counter-booking-list" element={<CounterBookingList />} />
          <Route path="/employee/counter-get-ticket" element={<CounterGetTicket />} />
          
          { /* Policies Routes */}
          <Route path="/terms" element={<GeneralTerms />} />
          <Route path="/payment-policy" element={<PaymentPolicy />} />
          <Route path="/delivery-policy" element={<DeliveryPolicy />} />
          <Route path="/information-security" element={<InformationSecurity />} />
          <Route path="/returns-refunds" element={<InspectionReturns />} />
          
          {/* Catch-all route for 404 */}



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