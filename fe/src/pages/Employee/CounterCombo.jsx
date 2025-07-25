import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
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
    console.log("ComboSelection: Redux state.booking on render:", bookingState);

    const [combos, setCombos] = useState([]);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loadingCombos, setLoadingCombos] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [showCombos, setShowCombos] = useState(true);
    const [showProducts, setShowProducts] = useState(false);

    useEffect(() => {
        console.log("ComboSelection useEffect (initial mount/re-render): movieDetails:", movieDetails, "selectedSeats:", selectedSeats, "totalSeatPrice:", totalSeatPrice);
        const fetchCombos = async () => {
            try {
                setLoadingCombos(true);
                const response = await axios.get(API_COMBO_BASE_URL);
                const activeCombos = response.data.combos.filter(combo => combo.status === 'active');

                const fetchedCombos = activeCombos.map(combo => ({
                    id: combo._id,
                    name: combo.comboName,
                    price: combo.price,
                    image: combo.image_url || darkknight,
                    description: combo.description,
                    startDate: combo.startDate,
                    endDate: combo.endDate,
                    items: combo.items,
                    status: combo.status
                }));

                setCombos(fetchedCombos);

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
        dispatch(setSelectedCombos({ combos: [], totalPrice: 0 }));
        fetchCombos();
    }, []);

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
        dispatch(setSelectedProducts({ products: [], totalPrice: 0 }));
    }, []);



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
        const selectedProducts = products.map(p => ({
            id: p._id,
            name: p.productName,
            price: p.price,
            quantity: quantities[p._id],
            image: p.image_url || ''
        })).filter(p => p.quantity > 0);
        const totalProductsPrice = selectedProducts.reduce(
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
            products: selectedProducts,
            totalPrice: totalProductsPrice
        }));

        // Gói tất cả lại trong 1 object
        const bookingState = {
            movieDetails,
            selectedShowtimeTime,
            fullShowtimeDate,
            selectedSeats,
            ticketPrice,
            selectedCombos: selectedComboList,
            combosTotal: totalComboPrice,
            selectedProducts,
            totalProductsPrice,
            productsTotal: totalProductsPrice,
            finalTotal: total,
            userInformation
        };

        // Lưu toàn bộ booking state vào localStorage
        localStorage.setItem('bookingState', JSON.stringify(bookingState));

        // Chuyển trang
        navigate('/employee/counter-confirm');
    };


    return (
        <SidebarLayout>
            <div className="min-h-screen text-white py-6 px-4 sm:px-6 lg:px-8 relative">
  <button
    onClick={() => navigate(-1)}
    className="absolute top-4 left-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded z-10"
  >
    ← Back
  </button>

  <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-4 sm:p-6 shadow-md mt-12 sm:mt-0">
    <h1 className="text-xl sm:text-2xl font-bold text-center mb-6">COMBO POPCORN & DRINKS</h1>
    <hr className="border-gray-700 mb-4" />

    {/* COMBO SELECTION */}
    <div
      onClick={() => {
        setShowCombos(!showCombos);
        setShowProducts(false);
      }}
      className="cursor-pointer bg-gray-700 px-4 py-2 rounded-md text-white font-semibold mb-2"
    >
      Choose Your Combo
    </div>

    {showCombos && (
      loadingCombos ? (
        <div className="text-center text-gray-400">Loading combos...</div>
      ) : combos.length === 0 ? (
        <div className="text-center text-gray-400">No active combos available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {combos.map((combo) => (
            <div
              key={combo.id}
              className="bg-slate-700 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center shadow"
            >
              <img
                src={combo.image}
                alt={combo.name}
                className="w-24 h-24 object-cover rounded"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/80x80/000000/FFFFFF?text=No+Image';
                }}
              />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-medium text-sm">{combo.name}</p>
                <p className="text-sm text-gray-300">
                  {combo.price.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={() => updateQuantity(combo.id, -1)}
                  className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="w-6 text-center">{quantities[combo.id]}</span>
                <button
                  onClick={() => updateQuantity(combo.id, 1)}
                  className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    )}

    {/* PRODUCT SELECTION */}
    <div
      onClick={() => {
        setShowProducts(!showProducts);
        setShowCombos(false);
      }}
      className="cursor-pointer bg-gray-700 px-4 py-2 rounded-md text-white font-semibold mb-2"
    >
      Choose Product
    </div>

    {showProducts && (
      loadingProducts ? (
        <div className="text-center text-gray-400">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-gray-400">No active products available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-slate-700 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center shadow"
            >
              <img
                src={product.image_url || 'https://placehold.co/80x80?text=No+Image'}
                alt={product.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1 text-center sm:text-left">
                <p className="font-medium text-sm">{product.name}</p>
                <p className="text-sm text-gray-300">
                  {product.price.toLocaleString('vi-VN')} VND
                </p>
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={() => updateQuantity(product._id, -1)}
                  className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center"
                >
                  <Minus className="w-4 h-4 text-white" />
                </button>
                <span className="w-6 text-center">{quantities[product._id]}</span>
                <button
                  onClick={() => updateQuantity(product._id, 1)}
                  className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    )}

    {/* TOTAL + CONTINUE */}
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
      <div className="bg-gray-700 px-6 py-2 rounded text-sm font-medium text-center sm:text-left">
        TOTAL: {finalTotal.toLocaleString('vi-VN')} VND
      </div>
      <button
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold w-full sm:w-auto"
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