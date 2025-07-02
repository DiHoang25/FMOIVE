import React, { useState, useEffect } from 'react';
import SidebarLayout from '../../components/Sidebar-Employee';
import { message, Form, Select } from 'antd';
import { InputNumber } from 'antd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [form] = Form.useForm();
    const [formData, setFormData] = useState({
        productName: '',
        description: '',
        price: '',
        category: '',
        stockQuantity: 1,
        image: '',
        imagePreview: ''
    });

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`http://localhost:5000/api/product/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setFormData({
                    ...response.data.product,
                    imagePreview: response.data.product.image_url
                });
            } catch (error) {
                console.error('Error fetching product:', error);
                message.error(error.response?.data?.message || 'Error loading product');
            }
        };
        fetchProduct();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formDataToSend = new FormData();
        formDataToSend.append('productName', formData.productName);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('price', formData.price);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('stockQuantity', formData.stockQuantity);
        if (formData.image) {
            formDataToSend.append('image', formData.image);
        }

        const hide = message.loading('Updating product...', 0);

        try {
            const response = await axios.put(`http://localhost:5000/api/product/${id}`, formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            hide();
            message.success('Product updated successfully!');
            navigate('/employee/view-product');
        } catch (error) {
            hide();
            console.error('Error:', error);
            message.error(error.response?.data?.message || 'Error updating product');
        }
    };

    return (
        <SidebarLayout>
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-slate-800 rounded-lg p-6 mt-6 max-w-6xl mx-auto shadow-xl">
                    <h1 className="text-2xl text-white font-bold text-center mb-4 pb-2 border-b border-gray-700">
                        Edit Product
                    </h1>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="productName"
                                        value={formData.productName}
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
                                    <div>
                                        <label className="block text-gray-300 mb-1">
                                            Stock Quantity <span className="text-red-500">*</span>
                                        </label>
                                        <InputNumber
                                            name="stockQuantity"
                                            value={formData.stockQuantity}
                                            onChange={(value) =>
                                                setFormData({ ...formData, stockQuantity: value })
                                            }
                                            className="w-full"
                                            min={1}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={formData.category || undefined}
                                        placeholder="Select category"
                                        onChange={(value) => setFormData({ ...formData, category: value })}
                                        className="w-full"
                                        options={[
                                            { label: 'Popcorn', value: 'popcorn' },
                                            { label: 'Drink', value: 'drink' },
                                            { label: 'Snack', value: 'snack' },
                                            { label: 'Other', value: 'other' }
                                        ]}                             
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-gray-300 mb-1">
                                        Product Image <span className="text-red-500">*</span>
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
                                    />
                                    <label htmlFor="image-upload" className="block cursor-pointer">
                                        {formData.imagePreview ? (
                                            <img
                                                src={formData.imagePreview}
                                                alt="Product Preview"
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
                                Update Product
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/employee/view-product')}
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

export default EditProduct;