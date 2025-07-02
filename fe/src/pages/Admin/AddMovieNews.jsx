// AddMovieNews.jsx
import React, { useState } from 'react';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { CheckCircleOutlined } from '@ant-design/icons';

const AddMovieNews = () => {
  const [formData, setFormData] = useState({
    title: '',
    image: null,
    preview: '',
    short_description: '',
    content: '',
    author: '',
    date: dayjs().format('YYYY-MM-DD') // ✅ fix cứng format ngay từ đầu
  });
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

  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Ensure date is always in YYYY-MM-DD format
    const formattedValue =
      name === 'date' ? dayjs(value).format('YYYY-MM-DD') : value;

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
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
    const form = new FormData();
    form.append('title', formData.title);
    form.append('short_description', formData.short_description);
    form.append('content', formData.content);
    form.append('author', formData.author);
    form.append('date', formData.date);
    if (formData.image) {
      form.append('image', formData.image);
    }

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
        const text = await response.text();
        throw new Error(`Failed: ${text}`);
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      message.error(err.message || 'Error adding news');
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6 max-w-4xl mx-auto bg-slate-800 text-white rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Add Movie News</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Title *</label>
            <input name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 bg-slate-700 rounded" />
          </div>

          <div>
            <label>Short Description *</label>
            <textarea name="short_description" value={formData.short_description} onChange={handleChange} required className="w-full p-2 bg-slate-700 rounded"></textarea>
          </div>

          <div>
            <label>Content *</label>
            <textarea name="content" value={formData.content} onChange={handleChange} required className="w-full p-2 bg-slate-700 rounded h-40"></textarea>
          </div>

          <div>
            <label>Author *</label>
            <input name="author" value={formData.author} onChange={handleChange} required className="w-full p-2 bg-slate-700 rounded" />
          </div>

          <div>
            <label>Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-2 bg-slate-700 rounded" />
          </div>

          <div>
            <label>Image *</label>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
            <label htmlFor="image-upload" className="cursor-pointer block">
              {formData.preview ? (
                <img src={formData.preview} alt="preview" className="h-32 object-contain" />
              ) : (
                <div className="h-32 flex items-center justify-center bg-slate-700 text-gray-300 rounded border border-dashed border-gray-500">
                  Click to upload image
                </div>
              )}
            </label>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => navigate('/admin/movienews-list')} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition">
              Cancel
            </button>
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded shadow hover:shadow-lg transition duration-300">
              Submit
            </button>
          </div>
        </form>
      </div>

      <Modal
        open={success}
        onCancel={() => setSuccess(false)}
        footer={null}
        centered
        width={350}
      >
        <div className="text-center p-6">
          <div className="text-green-500 text-5xl mb-4">✔️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Success</h3>
          <p className="text-sm text-gray-600 mb-4">
            Movie news added successfully. Do you want to add another news?
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSuccess(false);
                resetForm();
              }}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Yes
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                navigate('/admin/movienews-list');
              }}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              No
            </button>
          </div>
        </div>
      </Modal>

    </SidebarLayout>
  );
};

export default AddMovieNews;
