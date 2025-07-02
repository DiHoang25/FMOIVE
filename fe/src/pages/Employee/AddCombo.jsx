import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/Sidebar-Employee';
import DatePicker from '../../components/DatePicker';
import { Select, message, Form } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { InputNumber } from 'antd';
import axios from 'axios';

const AddCombo = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        imagePreview: '',
        fromDate: null,
        toDate: null
    });

    const [productOptions, setProductOptions] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/product', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.products) {
                    setProductOptions(response.data.products.map(p => ({
                        id: p._id,
                        name: p.productName,
                        category: p.category
                    })));
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const [comboItems, setComboItems] = useState([]);
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
        message.error('Vui lòng chọn ảnh cho combo.');
        return;
    }

    const form = new FormData();
    form.append('comboName', formData.name);
    form.append('description', formData.description);
    form.append('price', formData.price);
    form.append('startDate', formData.fromDate?.toISOString());
    form.append('endDate', formData.toDate?.toISOString());
    form.append('isActive', true);
    form.append('image', formData.image);

    form.append('items', JSON.stringify(
        comboItems.map(item => ({
            productName: productOptions.find(p => p.id === item.productId)?.name,
            quantity: item.quantity
        }))
    ));

    const hide = message.loading('Adding combo...', 0);

    try {
        const response = await axios.post('http://localhost:5000/api/combo/new_combo', form, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        hide();
        message.success('Combo added successfully!');
        navigate('/employee/view-combo');
    } catch (error) {
        hide();
        console.error('Error:', error);
        message.error('Error adding combo');
    }
};

    return (
        <SidebarLayout>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-800 rounded-lg p-6 mt-6 max-w-6xl mx-auto shadow-xl">
                    <h1 className="text-2xl text-white font-bold text-center mb-4 pb-2 border-b border-gray-700">
                        Add New Combo
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Combo Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full p-2 rounded bg-slate-700 text-white"
                                        rows="3"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            Price <span className="text-red-500">*</span>
                                        </label>
                                        <InputNumber
                                            name="price"
                                            value={formData.price}
                                            onChange={(value) =>
                                                setFormData({ ...formData, price: value })
                                            }
                                            className="w-full"
                                            min={0}
                                            formatter={value => `${value}₫`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/₫\s?|(,*)/g, '')}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Combo Items <span className="text-red-500">*</span>
                                    </label>

                                    <Select
                                        mode="multiple"
                                        placeholder="Choose products"
                                        className="w-full"
                                        value={comboItems.map(item => item.productId)}
                                        onChange={(selectedIds) => {
                                            const updated = selectedIds.map(id => {
                                                const existing = comboItems.find(item => item.productId === id);
                                                return existing || { productId: id, quantity: 1 };
                                            });
                                            setComboItems(updated);
                                        }}
                                        loading={productOptions.length === 0}
                                    >
                                        {productOptions.filter(p => !p.is_deleted).map(p => (
                                            <Select.Option key={p.id} value={p.id}>
                                                {p.name} ({p.category})
                                            </Select.Option>
                                        ))}
                                    </Select>

                                    {comboItems.length > 0 && (
                                        <div className="mt-2 space-y-2">
                                            {comboItems.map((item, index) => {
                                                const product = productOptions.find(p => p.id === item.productId);
                                                return (
                                                    <div key={item.productId} className="flex items-center space-x-4">
                                                        <span className="text-white w-32">{product?.name}</span>
                                                        <input
                                                            type="text"
                                                            pattern="[0-9]*"
                                                            inputMode="numeric"
                                                            className="w-24 p-1 rounded bg-slate-700 text-white"
                                                            value={item.quantity}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\D/g, '');
                                                                const quantity = value ? parseInt(value) : '';
                                                                setComboItems(prev =>
                                                                    prev.map((itm, i) =>
                                                                        i === index ? { ...itm, quantity } : itm
                                                                    )
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            From Date <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            name="fromDate"
                                            value={formData.fromDate}
                                            onChange={(date) => setFormData({ ...formData, fromDate: date })}
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            To Date <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            name="toDate"
                                            value={formData.toDate}
                                            onChange={(date) => setFormData({ ...formData, toDate: date })}
                                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Combo Image <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="file"
                                        name="image"
                                        accept="image/*"
                                        className="hidden"
                                        id="image-upload"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                const file = e.target.files[0];
                                                setFormData({
                                                    ...formData,
                                                    image: file,
                                                    imagePreview: URL.createObjectURL(file)
                                                });
                                            }
                                        }}
                                        required
                                    />
                                    <label htmlFor="image-upload" className="block cursor-pointer">
                                        {formData.imagePreview ? (
                                            <img
                                                src={formData.imagePreview}
                                                alt="Combo Preview"
                                                className="w-full h-32 object-contain rounded border-2 border-dashed border-gray-600"
                                            />
                                        ) : (
                                            <div className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center rounded text-gray-400">
                                                Click to upload image
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8 space-x-4">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                            >
                                Add Combo
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/employee')}
                                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default AddCombo;
