// AddMovieNews.jsx
import React, { useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin'; // Sử dụng SidebarLayout theo file gốc
import { Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import framer-motion
import dayjs from 'dayjs';

const AddMovieNews = () => {
    const [formData, setFormData] = useState({
        title: '',
        image: null,
        preview: '',
        short_description: '',
        content: '',
        author: '',
        date: dayjs().format('YYYY-MM-DD')
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const resetForm = () => {
        setFormData({
            title: '',
            image: null,
            preview: '',
            short_description: '',
            content: '',
            author: '',
            date: dayjs().format('YYYY-MM-DD')
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const formattedValue = name === 'date' ? dayjs(value).format('YYYY-MM-DD') : value;
        setFormData(prev => ({ ...prev, [name]: formattedValue }));
    };

    const handleImageUpload = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData(prev => ({
                ...prev,
                image: file,
                preview: URL.createObjectURL(file)
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // === VALIDATION CHECKS ===
        const { title, short_description, content, author, date, image } = formData;
        if (!title.trim()) return message.error("Please enter a title.");
        if (!short_description.trim()) return message.error("Please enter a short description.");
        if (!content.trim()) return message.error("Please enter content.");
        if (!author.trim()) return message.error("Please enter an author.");
        if (!date) return message.error("Please select a date.");
        if (!image) return message.error("Please select an image.");

        const form = new FormData();
        form.append('title', title);
        form.append('short_description', short_description);
        form.append('content', content);
        form.append('author', author);
        form.append('date', date);
        form.append('image', image);

        const hide = message.loading('Adding news...', 0);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/movie-news/add', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: form
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add news');
            }

            hide();
            setSuccess(true);
        } catch (err) {
            hide();
            console.error(err);
            message.error(err.message || 'Error adding news');
        } finally {
            setLoading(false);
        }
    };

    // Style chung cho input
    const inputClass = "bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200";

    return (
        <SidebarLayout>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-6xl mx-auto"
                >
                    <div className="text-center mb-8">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Add Movie News
                            </h1>
                            <p className="text-slate-300 text-sm md:text-lg">Create a new article for movie news</p>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                        <div
                            className="w-full max-w-4xl mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
                            style={{ borderRadius: '20px' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
                            <div className="relative p-5 lg:p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        {/* Title */}
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                                            <label className="block text-gray-300 mb-1 font-medium text-sm">Title <span className="text-red-500">*</span></label>
                                            <input name="title" value={formData.title} onChange={handleChange} className={inputClass} />
                                        </motion.div>

                                        {/* Short Description */}
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                                            <label className="block text-gray-300 mb-1 font-medium text-sm">Short Description <span className="text-red-500">*</span></label>
                                            <textarea name="short_description" value={formData.short_description} onChange={handleChange} rows="3" className={inputClass}></textarea>
                                        </motion.div>

                                        {/* Content */}
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                                            <label className="block text-gray-300 mb-1 font-medium text-sm">Content <span className="text-red-500">*</span></label>
                                            <textarea name="content" value={formData.content} onChange={handleChange} rows="6" className={inputClass}></textarea>
                                        </motion.div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            {/* Author */}
                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">Author <span className="text-red-500">*</span></label>
                                                <input name="author" value={formData.author} onChange={handleChange} className={inputClass} />
                                            </motion.div>

                                            {/* Date */}
                                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                                                <label className="block text-gray-300 mb-1 font-medium text-sm">Date <span className="text-red-500">*</span></label>
                                                <input type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} />
                                            </motion.div>
                                        </div>

                                        {/* Image Upload */}
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
                                            <label className="block text-gray-300 mb-1 font-medium text-sm">Image <span className="text-red-500">*</span></label>
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                                            <label htmlFor="image-upload" className="block cursor-pointer">
                                                {formData.preview ? (
                                                    <img src={formData.preview} alt="preview" className="w-full h-40 object-contain rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all duration-200" />
                                                ) : (
                                                    <div className="w-full h-40 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-xl text-gray-400 hover:border-blue-500 transition-all duration-200">
                                                        Click to upload image
                                                    </div>
                                                )}
                                            </label>
                                        </motion.div>
                                    </div>

                                    {/* Buttons */}
                                    <motion.div
                                        className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-end gap-3"
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}
                                    >
                                        <button type="button" onClick={() => navigate('/admin/movienews-list')} className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition duration-200">
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" style={{ borderRadius: '12px' }}>
                                            {loading ? 'Submitting...' : 'Submit News'}
                                        </button>
                                    </motion.div>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Success Modal */}
            <Modal open={success} onCancel={() => setSuccess(false)} footer={null} centered width={350} className="custom-ant-modal">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
                    className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-6 rounded-xl shadow-lg w-full"
                >
                    <div className="text-center">
                        <div className="mb-4 flex justify-center">
                            <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Success!</h3>
                        <p className="text-gray-300 mb-6 text-sm">Movie news added successfully. Do you want to add another?</p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button onClick={() => { setSuccess(false); resetForm(); }} className="flex-1 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-semibold">
                                Yes
                            </button>
                            <button onClick={() => { setSuccess(false); navigate('/admin/movienews-list'); }} className="flex-1 px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 text-sm font-semibold">
                                No
                            </button>
                        </div>
                    </div>
                </motion.div>
            </Modal>
        </SidebarLayout>
    );
};

export default AddMovieNews;