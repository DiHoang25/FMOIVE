// EditMovieNews.jsx
import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import SidebarLayout from '../../components/Sidebar-Admin';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const EditMovieNews = () => {
  const token = localStorage.getItem('token');
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    content: '',
    author: '',
    date: '',
    image: null,
    preview: '',
  });
  const [editStates, setEditStates] = useState({
    title: false,
    short_description: false,
    content: false,
    author: false,
    date: false,
    image: false,
  });

  const toggleEdit = (field) => {
    setEditStates((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/movie-news/${id}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            title: data.title,
            short_description: data.short_description,
            content: data.content,
            author: data.author,
            date: dayjs(data.date).format('YYYY-MM-DD'),
            image: null,
            preview: data.image_url,
          });
        } else {
          message.error('Không tìm thấy bài viết');
        }
      } catch (error) {
        message.error('Lỗi khi tải dữ liệu');
      }
    };
    fetchNews();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
        preview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('short_description', formData.short_description);
    dataToSend.append('content', formData.content);
    dataToSend.append('author', formData.author);
    dataToSend.append('date', formData.date);
    if (formData.image) {
      dataToSend.append('image', formData.image);
    }

    const hide = message.loading('Updating news...', 0);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/movie-news/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: dataToSend,
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Update failed');
      }
      hide();
      setSuccess(true);
    } catch (err) {
      hide();
      message.error(err.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };
  
  const renderField = (field, label, type = 'text') => {
    const commonInputClass = "bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200";
    const displayClass = "flex justify-between items-center bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-transparent text-base";
    const value = formData[field];

    let content;
    if (editStates[field]) {
        if (type === 'textarea') {
            content = <textarea name={field} value={value} onChange={handleChange} rows={field === 'content' ? 6 : 3} className={commonInputClass} />;
        } else {
            content = <input type={type} name={field} value={value} onChange={handleChange} className={commonInputClass} />;
        }
    } else {
        content = (
            <div className={displayClass}>
                <span className="truncate pr-4">{type === 'date' && value ? dayjs(value).format('DD/MM/YYYY') : value}</span>
                <button type="button" onClick={() => toggleEdit(field)} className="text-blue-400 hover:text-blue-300 ml-4 flex-shrink-0">Edit</button>
            </div>
        );
    }

    return (
        <div>
            <label className="block text-gray-300 mb-1 font-medium text-sm">{label}</label>
            {content}
        </div>
    );
  };


  return (
    <SidebarLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            Edit Movie News
                        </h1>
                        <p className="text-slate-300 text-sm md:text-lg">Update the details of the news article</p>
                    </motion.div>
                </div>

                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                    <div className="w-full max-w-4xl mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl" style={{ borderRadius: '20px' }}>
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
                        <div className="relative p-5 lg:p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    <motion.div variants={{hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.1 }}>{renderField('title', 'Title')}</motion.div>
                                    <motion.div variants={{hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.2 }}>{renderField('short_description', 'Short Description', 'textarea')}</motion.div>
                                    <motion.div variants={{hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.3 }}>{renderField('content', 'Content', 'textarea')}</motion.div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <motion.div variants={{hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.4 }}>{renderField('author', 'Author')}</motion.div>
                                        <motion.div variants={{hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.5 }}>{renderField('date', 'Date', 'date')}</motion.div>
                                    </div>
                                    
                                    <motion.div variants={{hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 }}} initial="hidden" animate="visible" transition={{ duration: 0.4, delay: 0.6 }}>
                                        <label className="block text-gray-300 mb-1 font-medium text-sm">Image</label>
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

                                <motion.div className="mt-8 flex flex-col sm:flex-row justify-center gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
                                    <button type="button" onClick={() => navigate('/admin/movienews-list')} className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition">Cancel</button>
                                    <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:opacity-50">
                                        {loading ? 'Saving...' : 'Update News'}
                                    </button>
                                </motion.div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <Modal open={success} onCancel={() => setSuccess(false)} footer={null} centered width={350} className="custom-ant-modal">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-6 rounded-xl shadow-lg w-full">
                    <div className="text-center">
                        <div className="mb-4 flex justify-center">
                            <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Success!</h3>
                        <p className="text-gray-300 mb-6 text-sm">Movie news updated successfully.</p>
                        <div className="flex gap-4">
                            <button onClick={() => navigate('/admin/movienews-list')} className="flex-1 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">View News List</button>
                            <button onClick={() => setSuccess(false)} className="flex-1 px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Stay</button>
                        </div>
                    </div>
                </motion.div>
            </Modal>
        </div>
    </SidebarLayout>
  );
};

export default EditMovieNews;