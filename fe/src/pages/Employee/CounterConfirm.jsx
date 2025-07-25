import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { message } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import SidebarLayout from "../../components/Sidebar-Employee";

// Redux imports
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedSeats,
  setSelectedCombos,
  setMovieDetails,
  updateGrandTotal,
  setUser,
} from "../../redux/bookingSlice";

dayjs.extend(customParseFormat);

// Constants
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

// Format room name: Extracts the numerical part from ROOM0*(\d+) to display "Cinema X".
const formatCinemaRoomName = (roomName) => {
  if (!roomName) return "N/A";
  const match = roomName.match(/ROOM0*(\d+)/);
  return match?.[1] ? `Cinema ${parseInt(match[1], 10)}` : roomName;
};

// Format movie time: Parses various date string formats and displays them in a user-friendly way.
const formatMovieTime = (timeString) => {
  if (!timeString || timeString === "N/A") return { display: "N/A" };
  
  try {
    const dateObj = new Date(timeString);
    // Check if the date object is valid
    if (isNaN(dateObj.getTime())) {
      // Fallback for specific string formats if direct parsing fails
      const parts = timeString.split(", ");
      if (parts.length >= 3) {
        const timePart = parts[parts.length - 1].trim();
        const dateParts = parts.slice(0, parts.length - 1).filter(part => !/\d{4}/.test(part.trim()));
        const dateOnly = dateParts.join(", ").trim();
        return { display: `${timePart}, ${dateOnly}` };
      }
      return { display: timeString }; // Return original string if unparseable
    }
    
    const optionsDate = { weekday: "long", month: "long", day: "numeric" };
    const optionsTime = { hour: "2-digit", minute: "2-digit", hour12: true };
    return {
      display: `${dateObj.toLocaleTimeString("en-US", optionsTime)}, ${dateObj.toLocaleDateString("en-US", optionsDate)}`,
    };
  } catch (error) {
    console.error("Error formatting movie time:", error);
    return { display: timeString };
  }
};

const CounterConfirm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Local component states
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [roomName, setRoomName] = useState("Loading...");
  
  // Products state - consider moving to Redux for consistency
  const [selectedProducts, setSelectedProductsLocal] = useState([]);
  const [productsTotal, setProductsTotal] = useState(0);

  // Get data from Redux store
  const {
    movieDetails,
    selectedSeats,
    totalSeatPrice,
    selectedCombos,
    totalComboPrice,
    user,
  } = useSelector((state) => state.booking);

  // Memoized derived states
  const movie = useMemo(() => movieDetails || {
    name: "N/A",
    image_url: "/placeholder.svg",
    version: "N/A",
    running_time: "N/A",
    time: "N/A",
    cinema_room: "N/A",
    genres: [],
  }, [movieDetails]);

  const seatsDisplay = useMemo(() => selectedSeats || [], [selectedSeats]);
  const combosDisplay = useMemo(() => selectedCombos || [], [selectedCombos]);
  
  const userData = useMemo(() => user || {
    name: "N/A",
    email: "N/A",
    phone: "N/A",
    username: "N/A",
    gender: "N/A",
    address: "N/A",
    id_card: "N/A",
    _id: null,
  }, [user]);

  // Memoized calculations
  const formattedTime = useMemo(() => formatMovieTime(movie.time), [movie.time]);
  const displayCinemaRoomName = useMemo(() => formatCinemaRoomName(roomName), [roomName]);
  
  const currentTicketPrice = useMemo(() => totalSeatPrice || 0, [totalSeatPrice]);
  const currentCombosTotal = useMemo(() => totalComboPrice || 0, [totalComboPrice]);
  const currentProductsTotal = useMemo(() => 
    selectedProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0),
    [selectedProducts]
  );
  const currentGrandTotal = useMemo(() => 
    currentTicketPrice + currentCombosTotal + currentProductsTotal - voucherDiscount,
    [currentTicketPrice, currentCombosTotal, currentProductsTotal, voucherDiscount]
  );

  // Cleanup function for localStorage
  const cleanupLocalStorage = useCallback(() => {
    const keysToRemove = [
      "counterMovieDetails",
      "counterSelectedSeats",
      "counterTotalSeatPrice",
      "counterSelectedCombos",
      "counterTotalComboPrice",
      "counterSelectedProducts",
      "counterTotalProductsPrice",
      "counterUser"
    ];
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }, []);

  // Data loading effect with better error handling
  useEffect(() => {
  const loadAllData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load booking data from localStorage - FIX PARSING
      const savedMovieDetails = JSON.parse(localStorage.getItem("counterMovieDetails") || "null");
      
      // FIX: Đảm bảo parse đúng selectedSeats
      let savedSelectedSeats = [];
      try {
        const seatsData = localStorage.getItem("counterSelectedSeats");
        if (seatsData && seatsData !== "[]") {
          savedSelectedSeats = JSON.parse(seatsData);
          
          // FIX: Kiểm tra nếu bị double stringify
          if (typeof savedSelectedSeats === 'string') {
            savedSelectedSeats = JSON.parse(savedSelectedSeats);
          }
          
          // Ensure it's an array
          if (!Array.isArray(savedSelectedSeats)) {
            savedSelectedSeats = [];
          }
        }
      } catch (parseError) {
        console.warn("Error parsing selectedSeats:", parseError);
        savedSelectedSeats = [];
      }

      const savedTotalSeatPrice = parseInt(localStorage.getItem("counterTotalSeatPrice") || "0");
      
      // Similar fix for combos and products
      let savedSelectedCombos = [];
      try {
        const combosData = localStorage.getItem("counterSelectedCombos");
        if (combosData && combosData !== "[]") {
          savedSelectedCombos = JSON.parse(combosData);
          if (typeof savedSelectedCombos === 'string') {
            savedSelectedCombos = JSON.parse(savedSelectedCombos);
          }
          if (!Array.isArray(savedSelectedCombos)) {
            savedSelectedCombos = [];
          }
        }
      } catch (parseError) {
        console.warn("Error parsing selectedCombos:", parseError);
        savedSelectedCombos = [];
      }

      const savedTotalComboPrice = parseInt(localStorage.getItem("counterTotalComboPrice") || "0");
      
      let savedSelectedProducts = [];
      try {
        const productsData = localStorage.getItem("counterSelectedProducts");
        if (productsData && productsData !== "[]") {
          savedSelectedProducts = JSON.parse(productsData);
          if (typeof savedSelectedProducts === 'string') {
            savedSelectedProducts = JSON.parse(savedSelectedProducts);
          }
          if (!Array.isArray(savedSelectedProducts)) {
            savedSelectedProducts = [];
          }
        }
      } catch (parseError) {
        console.warn("Error parsing selectedProducts:", parseError);
        savedSelectedProducts = [];
      }

      const savedTotalProductsPrice = parseInt(localStorage.getItem("counterTotalProductsPrice") || "0");
      const savedUser = JSON.parse(localStorage.getItem("counterUser") || "null");

      const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get("http://localhost:5000/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fetchedUser = response.data.user;
          dispatch(setUser({
            name: fetchedUser.fullname,
            email: fetchedUser.email,
            _id: fetchedUser._id,
            phone: fetchedUser.phone,
            username: fetchedUser.username,
            gender: fetchedUser.gender,
            address: fetchedUser.address,
            id_card: fetchedUser.id_card,
            role: fetchedUser.role,
          }));
        }

      console.log("Parsed data:", {
        savedSelectedSeats,
        savedSelectedCombos,
        savedSelectedProducts
      });

      // Dispatch to Redux với data đã được parse đúng
      dispatch(setMovieDetails(savedMovieDetails));
      
      if (savedSelectedSeats?.length > 0 || savedTotalSeatPrice > 0) {
        dispatch(setSelectedSeats({
          seats: savedSelectedSeats || [],
          totalPrice: savedTotalSeatPrice || 0,
        }));
      }
      
      if (savedSelectedCombos?.length > 0 || savedTotalComboPrice > 0) {
        dispatch(setSelectedCombos({
          combos: savedSelectedCombos || [],
          totalPrice: savedTotalComboPrice || 0,
        }));
      }
      
      setSelectedProductsLocal(savedSelectedProducts || []);
      setProductsTotal(savedTotalProductsPrice || 0);
      dispatch(setUser(savedUser));

      // ... rest of the code remains the same
    } catch (err) {
      console.error("❌ Error loading data:", err);
      setError(err.message || "Failed to load booking details");
      message.error(err.message || "Failed to load booking details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  loadAllData();
}, [dispatch]);

  // Update grand total in Redux
  useEffect(() => {
    dispatch(updateGrandTotal(currentGrandTotal));
  }, [currentGrandTotal, dispatch]);

  // Handle voucher change with better error handling
  const handleVoucherChange = useCallback((e) => {
    const selectedCode = e.target.value;
    setVoucherCode(selectedCode);
    
    try {
      if (selectedCode) {
        const selected = promotions.find((p) => p.promotion_code === selectedCode);
        if (selected) {
          const totalBeforeDiscount = currentTicketPrice + currentCombosTotal + currentProductsTotal;
          const discountValue = Math.floor((totalBeforeDiscount * selected.discount) / 100);
          setVoucherDiscount(discountValue);
        } else {
          setVoucherDiscount(0);
        }
      } else {
        setVoucherDiscount(0);
      }
    } catch (err) {
      console.error("Error applying voucher:", err);
      setVoucherDiscount(0);
      message.error("Error applying voucher discount");
    }
  }, [promotions, currentTicketPrice, currentCombosTotal, currentProductsTotal]);

  // Handle payment with improved error handling and validation
  const handleProceedToPayment = useCallback(async () => {
    if (isProcessing) return;

    try {
      setIsProcessing(true);
      setError("");

      // Validation
      if (!movieDetails || !user) {
        throw new Error("Missing essential booking information");
      }

      if (seatsDisplay.length === 0) {
        throw new Error("Please select at least one seat");
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      // Save booking state
      const bookingStateToSave = {
        movieDetails,
        selectedSeats,
        totalSeatPrice,
        selectedCombos,
        totalComboPrice,
        selectedProducts,
        productsTotal: currentProductsTotal,
        user,
        voucherCode,
        voucherDiscount,
        finalTotal: currentGrandTotal,
      };
      localStorage.setItem("bookingState", JSON.stringify(bookingStateToSave));

      // Create booking payload
      const bookingPayload = {
        movieDetails: {
          movieId: movieDetails._id,
          name: movieDetails.name,
          imageUrl: movieDetails.image_url,
          version: movieDetails.version,
          runningTime: movieDetails.running_time,
          genres: movieDetails.genres,
          time: movieDetails.time ? dayjs(movieDetails.time).toISOString() : null,
          cinema_room: movieDetails.cinema_room,
        },
        selectedSeats: seatsDisplay,
        totalSeatPrice: currentTicketPrice,
        ...(combosDisplay.length > 0 && {
          selectedCombos: combosDisplay.map((c) => ({
            comboId: c._id,
            name: c.name,
            quantity: c.quantity,
            price: c.price,
            imageUrl: c.image_url,
          })),
          totalComboPrice: currentCombosTotal,
        }),
        ...(selectedProducts.length > 0 && {
          selectedProducts: selectedProducts.map((p) => ({
            productId: p._id,
            name: p.name,
            quantity: p.quantity,
            price: p.price,
            imageUrl: p.image_url,
          })),
          totalProductsPrice: currentProductsTotal,
        }),
        grandTotal: currentGrandTotal,
        user: userData,
        voucherCode: voucherCode || null,
        voucherDiscount: voucherDiscount,
      };

      // API call with better timeout and error handling
      const response = await axios.post(
        `${API_BASE_URL}/api/booking/create`,
        bookingPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 second timeout
        }
      );

      const createdBooking = response.data.booking;
      message.success("Booking created successfully! Redirecting to payment...");
      
      // Navigate to payment
      navigate("/employee/counter-payment", {
        state: {
          bookingId: createdBooking.bookingId,
          grandTotal: createdBooking.grandTotal,
          movieDetails,
          selectedSeats,
          selectedCombos,
          selectedProducts,
          ticketPrice: currentTicketPrice,
          combosTotal: currentCombosTotal,
          productsTotal: currentProductsTotal,
          finalTotal: currentGrandTotal,
          voucherCode,
          voucherDiscount,
          userInformation: user,
        },
      });

    } catch (err) {
      let errorMessage = "An unexpected error occurred.";
      
      if (err.response) {
        // API error response
        errorMessage = err.response.data?.message || `Server error: ${err.response.status}`;
      } else if (err.request) {
        // Network error
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (err.code === 'ECONNABORTED') {
        // Timeout error
        errorMessage = "Request timeout. Please try again.";
      } else {
        // Other errors
        errorMessage = err.message || errorMessage;
      }
      
      console.error("❌ Payment processing error:", err);
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [
    isProcessing, movieDetails, user, seatsDisplay, currentTicketPrice, 
    currentCombosTotal, currentProductsTotal, currentGrandTotal,
    selectedSeats, totalSeatPrice, selectedCombos, totalComboPrice, 
    selectedProducts, voucherCode, voucherDiscount, userData, 
    combosDisplay, navigate
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Optional: cleanup localStorage on unmount
      // cleanupLocalStorage();
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500 border-solid mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-300">Loading booking details...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Confirm Your Booking
            </h1>
            <p className="text-gray-400 text-lg">Review your selection before proceeding to payment</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Movie & Selection Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Movie Information Card */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-2xl">
                <div className="flex gap-6 items-start">
                  <div className="relative group">
                    <img
                      src={movie.image_url || "/placeholder.svg"}
                      alt="Movie Poster"
                      className="w-32 h-48 rounded-xl object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <h2 className="text-2xl font-bold text-white">{movie.name}</h2>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                        <span className="font-medium">{displayCinemaRoomName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{formattedTime.display}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                          />
                        </svg>
                        <span>
                          {movie.version || "N/A"} • {movie.running_time} min •{" "}
                          {movie.genres && movie.genres.length > 0 ? movie.genres.join(", ") : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Seats Selection Card */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 9V7c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h1v2c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2h8v2c0 .6.4 1 1 1h2c.6 0 1-.4 1-1v-2h1c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM6 7h12v2H6V7zm14 8H4v-4h16v4z" />
                      <rect x="7" y="10" width="2" height="3" rx="1" />
                      <rect x="11" y="10" width="2" height="3" rx="1" />
                      <rect x="15" y="10" width="2" height="3" rx="1" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Selected Seats</h3>
                  <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                    {seatsDisplay.length} seat{seatsDisplay.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {seatsDisplay.length > 0 ? (
                    seatsDisplay.map((seat) => (
                      <div
                        key={seat.label || seat} // Use seat.label if available, otherwise just seat
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transform hover:scale-105 transition-transform duration-200"
                      >
                        {seat.label || seat}
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 italic">No seats selected.</span>
                  )}
                </div>
              </div>

              {/* Combos Card */}
              {combosDisplay.length > 0 && (
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.5 8.64L13.77 4H8.5c-.28 0-.5.22-.5.5v4.14zM15.5 4.5c0-.28-.22-.5-.5-.5h-1.23L9.5 8.36V4.5c0-.28-.22-.5-.5-.5S8.5 4.22 8.5 4.5v4.14L3.23 4H2.5c-.28 0-.5.22-.5.5v15c0 .28.22.5.5.5h19c.28 0 .5-.22.5-.5v-15c0-.28-.22-.5-.5-.5h-.73L15.5 8.64V4.5zM20 19H4V9.5h16V19z" />
                        <circle cx="7" cy="12" r="1" />
                        <circle cx="12" cy="14" r="1" />
                        <circle cx="17" cy="12" r="1" />
                        <circle cx="9" cy="16" r="1" />
                        <circle cx="15" cy="16" r="1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Popcorn & Drinks</h3>
                  </div>
                  <div className="space-y-3">
                    {combosDisplay.map((combo) => (
                      <div
                        key={combo.id || combo._id} // Use combo.id or combo._id
                        className="flex justify-between items-center bg-slate-700/50 px-4 py-3 rounded-xl border border-slate-600/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span className="font-medium">{combo.name}</span>
                          <span className="bg-slate-600 text-gray-300 px-2 py-1 rounded-full text-xs">
                            ×{combo.quantity}
                          </span>
                        </div>
                        <span className="font-semibold text-amber-400">
                          {(combo.price * combo.quantity).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Card */}
              {selectedProducts.length > 0 && ( // Use local state for products
                <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 2v2H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V2h-2v2H9V2H7zm11 4v14H6V6h12z" />
                        <path d="M8 8h8v2H8V8zm0 3h8v1H8v-1zm0 2h8v1H8v-1z" />
                        <ellipse cx="12" cy="17" rx="3" ry="1" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">Additional Products</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex justify-between items-center bg-slate-700/50 px-4 py-3 rounded-xl border border-slate-600/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">{product.name}</span>
                          <span className="bg-slate-600 text-gray-300 px-2 py-1 rounded-full text-xs">
                            ×{product.quantity}
                          </span>
                        </div>
                        <span className="font-semibold text-blue-400">
                          {(product.price * product.quantity).toLocaleString("vi-VN")} VND
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - User Info, Voucher & Payment */}
            <div className="space-y-6">
              {/* User Information Card */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Your Information</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-slate-600/30">
                    <span className="text-gray-400">Full Name:</span>
                    <span className="font-medium">{userData.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-600/30">
                    <span className="text-gray-400">Email:</span>
                    <span className="font-medium">{userData.email}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-600/30">
                    <span className="text-gray-400">Phone:</span>
                    <span className="font-medium">{userData.phone}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-400">Username:</span>
                    <span className="font-medium">{userData.username}</span>
                  </div>
                </div>
              </div>

              {/* Voucher Card */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Voucher Code</h3>
                </div>
                <select
                  className="w-full bg-slate-700/70 text-white px-4 py-3 rounded-xl border border-slate-600/30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  value={voucherCode}
                  onChange={handleVoucherChange} // Use the new handler
                >
                  <option value="">-- Select Promotion Code --</option>
                  {promotions.map((promo) => (
                    <option key={promo._id} value={promo.promotion_code}>
                      {promo.promotion_code} ({promo.discount}%)
                    </option>
                  ))}
                </select>
                {voucherDiscount > 0 && (
                  <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Discount applied: -{voucherDiscount.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Summary Card */}
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">Payment Summary</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Tickets ({seatsDisplay.length})</span>
                    <span className="font-semibold">{currentTicketPrice.toLocaleString("vi-VN")} VND</span>
                  </div>

                  {combosDisplay.length > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Combos</span>
                      <span className="font-semibold">{currentCombosTotal.toLocaleString("vi-VN")} VND</span>
                    </div>
                  )}

                  {selectedProducts.length > 0 && ( // Use local state for products here
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Products</span>
                      <span className="font-semibold">{currentProductsTotal.toLocaleString("vi-VN")} VND</span>
                    </div>
                  )}

                  {voucherDiscount > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-green-400">Voucher Discount</span>
                      <span className="font-semibold text-green-400">
                        -{voucherDiscount.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  )}

                  <div className="border-t border-slate-600/50 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-white">Total</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                        {currentGrandTotal.toLocaleString("vi-VN")} VND
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                  <p className="text-blue-400 text-sm flex items-start gap-2">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    You will be redirected to our secure payment gateway after confirmation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 mt-12">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 bg-slate-700/80 hover:bg-slate-600/80 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50"
            >
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <button
              onClick={handleProceedToPayment}
              disabled={isProcessing}
              className="group flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-red-500/25 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  Proceed to Payment
                  <svg
                    className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl max-w-2xl mx-auto">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
};

export default CounterConfirm;
