import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import axios from 'axios';
import { message } from 'antd';
import SidebarLayout from '../../components/Sidebar-Employee';
import darkknight from '../../assets/darkknight.jpg';

const API_COMBO_BASE_URL = 'http://localhost:5000/api/combo';
const API_PRODUCT_BASE_URL = 'http://localhost:5000/api/product';

const ComboSelection = () => {
    const navigate = useNavigate();
    const { state } = useLocation();

    const {
        movieDetails = {},
        selectedShowtimeTime = '',
        fullShowtimeDate = '',
        selectedSeats = [],
        ticketPrice = 0,
        userInformation = {},
    } = state || {};

    const [combos, setCombos] = useState([]);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loadingCombos, setLoadingCombos] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [showCombos, setShowCombos] = useState(true);
    const [showProducts, setShowProducts] = useState(false);

    useEffect(() => {
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
                    acc[combo.id] = 0;
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
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const activeProducts = response.data.products.filter(p => !p.is_deleted);

            const initialQuantities = activeProducts.reduce((acc, product) => {
                acc[product._id] = 0;
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

    if (showProducts && products.length === 0) {
        fetchProducts();
    }
}, [showProducts]);


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
        const selectedCombos = combos.map(combo => ({
            id: combo.id,
            name: combo.name,
            price: combo.price,
            quantity: quantities[combo.id],
            image: combo.image
        })).filter(c => c.quantity > 0);

        const selectedProducts = products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            quantity: quantities[p._id],
            image: p.image_url || ''
        })).filter(p => p.quantity > 0);

        navigate('/employee/counter-confirm', {
            state: {
                movieDetails,
                selectedShowtimeTime,
                fullShowtimeDate,
                selectedSeats,
                selectedCombos,
                selectedProducts,
                ticketPrice,
                combosTotal,
                productsTotal,
                finalTotal,
                userInformation,
            },
        });
    };

    return (
        <SidebarLayout>
            <div className="min-h-screen text-white py-8 px-4">
                <div className="max-w-4xl mx-auto bg-slate-800 rounded-2xl p-6 shadow-md relative">
                    <button onClick={() => navigate(-1)} className="absolute top-4 left-4 text-white bg-gray-700 hover:bg-gray-600 px-4 py-1 rounded">
                        ← Back
                    </button>

                    <h1 className="text-2xl font-bold text-center mb-6">COMBO POPCORN & DRINKS</h1>
                    <hr className="border-gray-700 mb-4" />

                    <div onClick={() => { setShowCombos(!showCombos); setShowProducts(false); }} className="cursor-pointer bg-gray-700 px-4 py-2 rounded-md text-white font-semibold mb-2">
                        Choose Your Combo
                    </div>
                    {showCombos && (
                        loadingCombos ? <div className="text-center text-gray-400">Loading combos...</div> :
                            combos.length === 0 ? <div className="text-center text-gray-400">No active combos available.</div> :
                                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                    {combos.map(combo => (
                                        <div key={combo.id} className="bg-slate-700 rounded-lg p-4 flex gap-4 items-center shadow">
                                            <img src={combo.image} alt={combo.name} className="w-20 h-20 object-cover rounded" onError={(e) => { e.target.src = 'https://placehold.co/80x80/000000/FFFFFF?text=No+Image'; }} />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{combo.name}</p>
                                                <p className="text-sm text-gray-300">{combo.price.toLocaleString('vi-VN')} VND</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(combo.id, -1)} className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                                                    <Minus className="w-4 h-4 text-white" />
                                                </button>
                                                <span className="w-6 text-center">{quantities[combo.id]}</span>
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
                                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                    {products.map(product => (
                                        <div key={product._id} className="bg-slate-700 rounded-lg p-4 flex gap-4 items-center shadow">
                                            <img src={product.image_url || 'https://placehold.co/80x80?text=No+Image'} alt={product.name} className="w-20 h-20 object-cover rounded" />
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{product.name}</p>
                                                <p className="text-sm text-gray-300">{product.price.toLocaleString('vi-VN')} VND</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQuantity(product._id, -1)} className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                                                    <Minus className="w-4 h-4 text-white" />
                                                </button>
                                                <span className="w-6 text-center">{quantities[product._id]}</span>
                                                <button onClick={() => updateQuantity(product._id, 1)} className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center">
                                                    <Plus className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
                        <div className="bg-gray-700 px-6 py-2 rounded text-sm font-medium">
                            TOTAL: {finalTotal.toLocaleString('vi-VN')} VND
                        </div>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold" onClick={handleContinue}>
                            CONTINUE
                        </button>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default ComboSelection;
