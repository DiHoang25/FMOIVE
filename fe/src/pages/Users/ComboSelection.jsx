import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import axios from 'axios';
import { Modal, message, Tag } from 'antd'; // Tag is kept in case you need it for other statuses later
import { LoadingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// Redux imports
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCombos } from '../../redux/bookingSlice';

// Make sure these paths are correct relative to where ComboSelection.jsx is located
import darkknight from '../../assets/darkknight.jpg';

// Define your backend API base URL for combos
const API_COMBO_BASE_URL = 'http://localhost:5000/api/combo';

const ComboSelection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { movieDetails, selectedSeats, totalSeatPrice } = useSelector((state) => state.booking);

  // Component states
  const [combos, setCombos] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(true);
  const [quantities, setQuantities] = useState({});

  // States for Combo Detail Modal
  const [showComboDetailModal, setShowComboDetailModal] = useState(false);
  const [selectedComboDetails, setSelectedComboDetails] = useState(null);
  const [loadingComboDetails, setLoadingComboDetails] = useState(false);

  // Fallback for movie details
  const movie = movieDetails || {
    name: 'Movie Title N/A',
    image_url: darkknight,
    version: 'N/A',
    running_time: 'N/A',
    time: 'N/A',
    cinema_room: 'N/A',
    genres: [],
  };

  // Fetch Combo Data from API on component mount
  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoadingCombos(true);
        const response = await axios.get(API_COMBO_BASE_URL);
        // Filter combos to only show 'active' ones
        const activeCombos = response.data.combos.filter(combo => combo.status === 'active');

        const fetchedCombos = activeCombos.map(combo => {
          // Corrected: Use combo.image_url from backend, not combo.imageUrl
          const imageUrl = combo.image_url || darkknight;
          return {
            id: combo._id,
            name: combo.comboName,
            price: combo.price,
            image: imageUrl, // Now correctly assigned from combo.image_url
            description: combo.description,
            startDate: combo.startDate,
            endDate: combo.endDate,
            items: combo.items,
            status: combo.status
          };
        });
        setCombos(fetchedCombos);

        const initialQuantities = fetchedCombos.reduce((acc, combo) => {
          acc[combo.id] = 0;
          return acc;
        }, {});
        setQuantities(initialQuantities);

      } catch (error) {
        console.error('Error fetching combos:', error);
        message.error('Failed to load combos. Please try again.');
      } finally {
        setLoadingCombos(false);
      }
    };

    fetchCombos();
  }, []);

  // Update quantity handler
  const updateQuantity = (id, delta) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, prev[id] + delta),
    }));
  };

  // Calculate total combo price
  const totalComboPrice = combos.reduce((sum, combo) => sum + combo.price * (quantities[combo.id] || 0), 0);

  // Redirect if essential data is missing (optional)
  useEffect(() => {
    if (!movieDetails || !selectedSeats || totalSeatPrice === undefined) {
      console.warn("Missing essential booking details in Redux. Consider redirecting to a previous step.");
      // navigate('/');
    }
  }, [movieDetails, selectedSeats, totalSeatPrice, navigate]);

  // Handle Continue button click
  const handleContinue = () => {
    const selectedCombosWithQuantity = combos.filter(combo => quantities[combo.id] > 0).map(combo => ({
      id: combo.id,
      name: combo.name,
      price: combo.price,
      image: combo.image,
      quantity: quantities[combo.id]
    }));

    dispatch(setSelectedCombos({
      combos: selectedCombosWithQuantity,
      totalPrice: totalComboPrice,
    }));

    navigate('/confirm-booking');
  };

  // Handle combo item click to show details modal
  const handleComboClick = async (comboId) => {
    setLoadingComboDetails(true);
    setShowComboDetailModal(true); // Open modal immediately with loading state
    setSelectedComboDetails(null); // Clear previous details

    try {
      const response = await axios.get(`${API_COMBO_BASE_URL}/${comboId}`);
      setSelectedComboDetails(response.data.combo); // Set full combo details from API
    } catch (error) {
      console.error('Error fetching combo details:', error);
      message.error('Failed to load combo details.');
      setShowComboDetailModal(false); // Close modal on error
    } finally {
      setLoadingComboDetails(false);
    }
  };

  // Helper to format status tag color (kept for potential future use if status is re-added)
  const getStatusTagColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'upcoming': return 'blue';
      case 'expired': return 'red';
      case 'inactive': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4">
      {/* Custom styles for Ant Design Modal to remove border */}
      <style>
        {`
          /* Target the modal content itself */
          .ant-modal-content {
            border: none !important; /* Remove the border */
            box-shadow: none !important; /* Remove any default shadow if present */
            outline: none !important; /* Remove outline on focus */
            background-color: #1f2937 !important; /* Ensure background matches bodyStyle */
          }
          /* Target the modal header */
          .ant-modal-header {
            border-bottom: none !important; /* Remove border under the header */
            background-color: #1f2937 !important; /* Ensure header background matches bodyStyle */
            padding: 16px 24px !important; /* Adjust padding if needed */
          }
          /* Target the modal footer */
          .ant-modal-footer {
            border-top: none !important; /* Remove border above the footer */
            background-color: #1f2937 !important; /* Ensure footer background matches bodyStyle */
            padding: 10px 24px !important; /* Adjust padding if needed */
          }
          /* Ensure the close button doesn't have an outline */
          .ant-modal-close-x {
            outline: none !important;
          }
          .ant-modal-close {
            outline: none !important;
          }
        `}
      </style>
      <div className="max-w-4xl mx-auto bg-neutral-900 rounded-xl p-6 shadow-lg relative">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded"
        >
          ← Back
        </button>

        {/* Movie Info */}
        <h1 className="text-2xl font-bold text-center mb-6">COMBO POPCORN & DRINKS</h1>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <img
            src={movie.image_url}
            alt={movie.name}
            className="w-32 h-48 object-cover rounded-md"
          />
          <div className="text-sm flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-semibold">{movie.name}</h2>
              <p className="text-gray-400 text-xl">
                {movie.version || 'N/A'} • {movie.running_time} min • {movie.genres && movie.genres.length > 0 ? movie.genres.join(', ') : 'N/A'}
              </p>
            </div>
            <div className="mt-2">
              <p className="text-gray-200 text-2xl">{movie.time}</p>
              <p className="text-gray-200 text-2xl">{movie.cinema_room || 'N/A'}</p>
              <p className="text-gray-200 text-2xl">Seats: {selectedSeats ? selectedSeats.join(', ') : 'N/A'}</p>
              <p className="text-gray-200 text-2xl">Seat Price: {totalSeatPrice !== undefined ? totalSeatPrice.toLocaleString('vi-VN') : 'N/A'} VND</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-600 mb-6" />

        <h3 className="text-white font-semibold mb-4">The List of popcorn and drinks</h3>
        {loadingCombos ? (
          <div className="text-center text-gray-400">Loading combos...</div>
        ) : combos.length === 0 ? (
          <div className="text-center text-gray-400">No active combos available.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            {combos.map((combo) => (
              <div
                key={combo.id}
                className="bg-zinc-800 rounded-md p-4 flex items-center gap-4 cursor-pointer hover:bg-zinc-700 transition-colors"
                onClick={() => handleComboClick(combo.id)}
              >
                <img
                  src={combo.image}
                  alt={combo.name}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => { // Add onerror for combo list images
                    console.error(`Failed to load image for combo ${combo.name}:`, combo.image);
                    e.target.src = 'https://placehold.co/96x96/000000/FFFFFF?text=No+Image'; // Generic placeholder
                  }}
                />
                <div className="flex-1">
                  <p className="font-semibold">{combo.name}</p>
                  <p className="text-sm">{combo.price.toLocaleString('vi-VN')} VND</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); updateQuantity(combo.id, -1); }}
                    className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4 text-white" />
                  </button>
                  <span className="w-6 text-center">{quantities[combo.id] || 0}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); updateQuantity(combo.id, 1); }}
                    className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total and Continue */}
        <div className="flex justify-between items-center mt-6">
          <div className="bg-gray-700 text-white px-6 py-2 rounded text-sm">
            COMBO PRICE: {totalComboPrice.toFixed(2)} $
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold"
            onClick={handleContinue}
          >
            CONTINUE
          </button>
        </div>
      </div>

      {/* Combo Detail Modal */}
      <Modal
        title={<span className="text-white text-xl font-bold">Combo Details</span>}
        open={showComboDetailModal}
        onCancel={() => setShowComboDetailModal(false)}
        footer={[
          <button key="close" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md" onClick={() => setShowComboDetailModal(false)}>
            Close
          </button>,
        ]}
        width={700}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto', backgroundColor: '#1f2937', color: 'white' }}
        centered
      >
        {loadingComboDetails ? (
          <div className="text-center py-8">
            <LoadingOutlined style={{ fontSize: '24px', color: '#fff' }} />
            <p className="text-gray-400 mt-2">Loading combo details...</p>
          </div>
        ) : selectedComboDetails ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-4">
              <img
                src={selectedComboDetails.image_url || darkknight} // Corrected: Use image_url here too
                alt={selectedComboDetails.comboName}
                className="w-40 h-auto object-cover rounded-lg shadow-lg"
                onError={(e) => { // Add onerror for modal image
                    console.error(`Failed to load image for modal combo ${selectedComboDetails.comboName}:`, selectedComboDetails.image_url); // Corrected: Use image_url in error log
                    e.target.src = 'https://placehold.co/160x240/000000/FFFFFF?text=No+Image'; // Larger placeholder for modal
                }}
              />
              <div className="flex-1 text-white text-center sm:text-left">
                <h2 className="text-3xl font-bold mb-2">{selectedComboDetails.comboName}</h2>
                <p className="text-gray-300 text-lg mb-1">Price: <span className="font-semibold">${selectedComboDetails.price?.toFixed(2)}</span></p>
                <p className="text-gray-300 text-lg mb-1">Start Date: {dayjs(selectedComboDetails.startDate).format('DD/MM/YYYY')}</p>
                <p className="text-gray-300 text-lg mb-1">End Date: {dayjs(selectedComboDetails.endDate).format('DD/MM/YYYY')}</p>
              </div>
            </div>
            
            <h3 className="text-white font-semibold text-xl mt-4 mb-2 border-b border-gray-700 pb-2">Description:</h3>
            <p className="text-gray-300 text-base">{selectedComboDetails.description || 'No description available.'}</p>

            <h3 className="text-white font-semibold text-xl mt-4 mb-2 border-b border-gray-700 pb-2">Items in Combo:</h3>
            {selectedComboDetails.items && selectedComboDetails.items.length > 0 ? (
              <ul className="list-disc list-inside text-gray-300 text-base space-y-1">
                {selectedComboDetails.items.map((item, index) => (
                  <li key={index}>
                    <span className="font-semibold">{item.quantity} x {item.productName}</span> 
                    {/* Conditionally render product details only if productDetail exists */}
                    {item.productDetail && (
                      ` (Category: ${item.productDetail.category || 'N/A'}, Price: $${item.productDetail.price?.toFixed(2) || 'N/A'})`
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-base">No items defined for this combo.</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No combo details available.</div>
        )}
      </Modal>
    </div>
  );
};

export default ComboSelection;
