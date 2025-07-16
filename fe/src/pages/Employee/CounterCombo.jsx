import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd'; // Keeping Ant Design message as it was in the provided code
import SidebarLayout from '../../components/Sidebar-Employee';
import darkknight from '../../assets/darkknight.jpg';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedCombos, setSelectedProducts } from '../../redux/bookingSlice';

const API_COMBO_BASE_URL = 'http://localhost:5000/api/combo';
const API_PRODUCT_BASE_URL = 'http://localhost:5000/api/product';

const CounterCombo = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const dispatch = useDispatch();


    const {
        movieDetails = {},
        selectedShowtimeTime = '',
        fullShowtimeDate = '',
        selectedSeats = [],
        ticketPrice = 0,
        userInformation = {},
    } = state || {};

    const bookingState = useSelector((state) => state.booking);
    const { selectedCombos, totalSeatPrice, selectedProducts } = bookingState;
    console.log("CounterCombo: Redux state.booking on render:", bookingState);

    const [combos, setCombos] = useState([]);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loadingCombos, setLoadingCombos] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true); // Changed to true for initial loading
    const [showCombos, setShowCombos] = useState(true);
    const [showProducts, setShowProducts] = useState(false);

    // Effect to reset Redux state for combos and products on component mount
    useEffect(() => {
        dispatch(setSelectedCombos({ combos: [], totalPrice: 0 }));
        dispatch(setSelectedProducts({ products: [], totalPrice: 0 }));
    }, [dispatch]); // Runs only once on mount

    useEffect(() => {
        console.log("CounterCombo useEffect (initial mount/re-render): movieDetails:", movieDetails, "selectedSeats:", selectedSeats, "totalSeatPrice:", totalSeatPrice);
        const fetchCombos = async () => {
            try {
                setLoadingCombos(true);
                const response = await axios.get(API_COMBO_BASE_URL);
                const activeCombos = response.data.combos.filter(combo => combo.status === 'active');

                const fetchedCombos = activeCombos.map(combo => ({
                    id: combo._id,
                    name: combo.comboName,
                    price: combo.price,
                    image: combo.image_url || darkknight, // Use darkknight as fallback
                    description: combo.description,
                    startDate: combo.startDate,
                    endDate: combo.endDate,
                    items: combo.items,
                    status: combo.status
                }));

                setCombos(fetchedCombos);

                // Initialize quantities based on fetched combos and current Redux state
                const initialQuantities = fetchedCombos.reduce((acc, combo) => {
                    const existing = selectedCombos?.find((c) => c.id === combo.id);
                    acc[combo.id] = existing ? existing.quantity : 0;
                    return acc;
                }, {});
                setQuantities(prev => ({ ...prev, ...initialQuantities }));

            } catch (error) {
                console.error('Error fetching combos:', error);
                message.error('Failed to load combos. Please try again.');
            } finally {
                setLoadingCombos(false);
            }
        };
        fetchCombos();
    }, []); // Removed selectedCombos from dependency array to prevent infinite loop

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoadingProducts(true);
                const token = localStorage.getItem('token');
                if (!token) {
                    message.error('Bạn chưa đăng nhập!');
                    return;
                }

                const response = await axios.get(API_PRODUCT_BASE_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const activeProducts = response.data.products.filter(p => !p.is_deleted);

                const initialQuantities = activeProducts.reduce((acc, product) => {
                    const existing = selectedProducts?.find((p) => p.id === product._id);
                    acc[product._id] = existing ? existing.quantity : 0;
                    return acc;
                }, {});
                setProducts(activeProducts);
                setQuantities(prev => ({ ...prev, ...initialQuantities }));
            } catch (error) {
                console.error('Error fetching products:', error);
                message.error('Failed to load products.');
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []); // Removed selectedProducts from dependency array to prevent infinite loop


    const updateQuantity = (id, delta) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }));
    };

    const combosTotal = combos.reduce(
        (sum, combo) => sum + combo.price * (quantities[combo.id] || 0),
        0
    );

    const productsTotal = products.reduce(
        (sum, product) => sum + product.price * (quantities[product._id] || 0),
        0
    );

    const finalTotal = ticketPrice + combosTotal + productsTotal;


    const handleContinue = () => {
        // Lấy danh sách combo đã chọn
        const selectedComboList = combos.map(combo => ({
            id: combo.id,
            name: combo.name,
            price: combo.price,
            quantity: quantities[combo.id],
            image: combo.image
        })).filter(c => c.quantity > 0);

        const totalComboPrice = selectedComboList.reduce(
            (sum, c) => sum + c.price * c.quantity, 0
        );

        // Lấy danh sách sản phẩm đã chọn
        const selectedProductsList = products.map(p => ({ // Renamed to avoid conflict with prop
            id: p._id,
            name: p.productName,
            price: p.price,
            quantity: quantities[p._id],
            image: p.image_url || ''
        })).filter(p => p.quantity > 0);

        const totalProductsPrice = selectedProductsList.reduce(
            (sum, p) => sum + p.price * p.quantity, 0
        );

        // Tổng cộng
        const total = ticketPrice + totalComboPrice + totalProductsPrice;

        // Lưu vào Redux nếu cần
        dispatch(setSelectedCombos({
            combos: selectedComboList,
            totalPrice: totalComboPrice
        }));

        dispatch(setSelectedProducts({
            products: selectedProductsList,
            totalPrice: totalProductsPrice
        }));

        // Gói tất cả lại trong 1 object
        const bookingStateToPersist = { // Renamed to avoid conflict with Redux state
            movieDetails,
            selectedShowtimeTime,
            fullShowtimeDate,
            selectedSeats,
            ticketPrice,
            selectedCombos: selectedComboList,
            combosTotal: totalComboPrice,
            selectedProducts: selectedProductsList,
            productsTotal: totalProductsPrice,
            finalTotal: total,
            userInformation
        };

        // Lưu toàn bộ booking state vào localStorage
        localStorage.setItem('bookingState', JSON.stringify(bookingStateToPersist));

        // Chuyển trang
        navigate('/employee/counter-confirm');
    };


    return (
        <SidebarLayout>
            <div className="min-h-screen text-white py-8 px-4">
                <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-6 shadow-md"> {/* Removed 'relative' as it's no longer needed for the button */}
                    {/* New div to contain the back button and headline, using flex for proper flow */}
                    <div className="flex flex-col items-start mb-6"> {/* mb-6 pushes content below */}
                        <button onClick={() => navigate(-1)} className="text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded mb-4"> {/* mb-4 for spacing below the button */}
                            ← Back
                        </button>
                        <h1 className="text-2xl font-bold text-center w-full">COMBO POPCORN & DRINKS</h1> {/* w-full to ensure text centers within this flex item */}
                    </div>
                    <hr className="border-gray-700 mb-4" />

                    {/* Movie Info Section - Responsive */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6 bg-slate-800 p-4 rounded-md text-center sm:text-left">
                        {movieDetails.image_url && (
                            <img
                                src={movieDetails.image_url}
                                alt={movieDetails.name}
                                className="w-28 h-40 object-cover rounded shadow mx-auto sm:mx-0"
                            />
                        )}
                        <div className="text-white flex-1">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-1">{movieDetails.name || "Unknown Movie"}</h2>
                            <p className="text-gray-400 text-sm sm:text-base">
                                {fullShowtimeDate} • {selectedShowtimeTime} • {movieDetails?.cinema_room || "Room N/A"}
                            </p>
                            <p className="text-gray-400 text-sm sm:text-base">
                                Seats: {selectedSeats?.map(s => s.label).join(', ') || 'N/A'}
                            </p>
                            <p className="text-gray-400 text-sm sm:text-base">
                                Ticket Price: {ticketPrice.toLocaleString('vi-VN')} VND
                            </p>
                        </div>
                    </div>


                    <div onClick={() => { setShowCombos(!showCombos); setShowProducts(false); }} className="cursor-pointer bg-gray-700 px-4 py-2 rounded-md text-white font-semibold mb-2">
                        Choose Your Combo
                    </div>
                    {showCombos && (
                        loadingCombos ? <div className="text-center text-gray-400">Loading combos...</div> :
                            combos.length === 0 ? <div className="text-center text-gray-400">No active combos available.</div> :
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"> {/* Changed to grid-cols-1 for better mobile stacking */}
                                    {combos.map(combo => (
                                        <div key={combo.id} className="bg-slate-700 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-center shadow"> {/* Added flex-col sm:flex-row */}
                                            <img
                                                src={combo.image}
                                                alt={combo.name}
                                                className="w-20 h-20 object-cover rounded mx-auto sm:mx-0" // Added mx-auto sm:mx-0
                                                onError={(e) => { e.target.src = 'https://placehold.co/80x80/000000/FFFFFF?text=No+Image'; }}
                                            />
                                            <div className="flex-1 text-center sm:text-left"> {/* Added text-center sm:text-left */}
                                                <p className="font-medium text-sm">{combo.name}</p>
                                                <p className="text-sm text-gray-300">{combo.price.toLocaleString('vi-VN')} VND</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0"> {/* Added mt-2 sm:mt-0 for spacing */}
                                                <button onClick={() => updateQuantity(combo.id, -1)} className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                                                    <Minus className="w-4 h-4 text-white" />
                                                </button>
                                                <span className="w-6 text-center">{quantities[combo.id] || 0}</span>
                                                <button onClick={() => updateQuantity(combo.id, 1)} className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center">
                                                    <Plus className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                    )}

                    <div onClick={() => { setShowProducts(!showProducts); setShowCombos(false); }} className="cursor-pointer bg-gray-700 px-4 py-2 rounded-md text-white font-semibold mb-2">
                        Choose Product
                    </div>
                    {showProducts && (
                        loadingProducts ? <div className="text-center text-gray-400">Loading products...</div> :
                            products.length === 0 ? <div className="text-center text-gray-400">No active products available.</div> :
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"> {/* Changed to grid-cols-1 for better mobile stacking */}
                                    {products.map(product => (
                                        <div key={product._id} className="bg-slate-700 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-center shadow"> {/* Added flex-col sm:flex-row */}
                                            <img
                                                src={product.image_url || 'https://placehold.co/80x80?text=No+Image'}
                                                alt={product.productName} // Changed to productName for consistency
                                                className="w-20 h-20 object-cover rounded mx-auto sm:mx-0" // Added mx-auto sm:mx-0
                                            />
                                            <div className="flex-1 text-center sm:text-left"> {/* Added text-center sm:text-left */}
                                                <p className="font-medium text-sm">{product.productName}</p> {/* Changed to productName */}
                                                <p className="text-sm text-gray-300">{product.price.toLocaleString('vi-VN')} VND</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 sm:mt-0"> {/* Added mt-2 sm:mt-0 for spacing */}
                                                <button onClick={() => updateQuantity(product._id, -1)} className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                                                    <Minus className="w-4 h-4 text-white" />
                                                </button>
                                                <span className="w-6 text-center">{quantities[product._id] || 0}</span>
                                                <button onClick={() => updateQuantity(product._id, 1)} className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center">
                                                    <Plus className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                    )}

                    {/* Total and Continue - Responsive */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                        <div className="bg-gray-700 px-6 py-2 rounded text-sm sm:text-base font-medium w-full sm:w-auto text-center"> {/* Added w-full sm:w-auto text-center */}
                            TOTAL: {finalTotal.toLocaleString('vi-VN')} VND
                        </div>
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold w-full sm:w-auto mt-2 sm:mt-0" // Added w-full sm:w-auto mt-2 sm:mt-0
                            onClick={handleContinue}
                        >
                            CONTINUE
                        </button>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default CounterCombo;
    