// src/pages/Admin/MovieNewsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal, message } from 'antd';
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaEye, FaTrash, FaSpinner, FaEdit } from 'react-icons/fa';
import Pagination from '../../components/PaginationHomepage';
import dayjs from 'dayjs';

const MovieNewsList = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/movie-news');
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error('Fetch failed:', err);
        message.error('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleDelete = async (item) => {
    Modal.confirm({
      title: 'Delete this news?',
      content: `Are you sure you want to delete "${item.title}"?`,
      okText: 'Yes',
      cancelText: 'No',
      okType: 'danger',
      onOk: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/movie-news/${item._id}/delete`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error('Failed');
          setNews((prev) => prev.filter((n) => n._id !== item._id));
          message.success('Deleted');
        } catch (err) {
          console.error(err);
          message.error('Delete failed');
        }
      },
    });
  };

  const paginatedNews = news.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(news.length / itemsPerPage);

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="relative flex items-center justify-center mb-4">
          <h2 className="text-2xl font-bold">Movie News Management</h2>
          <Link
            to="/admin/add-movienews"
            className="absolute right-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md shadow flex items-center"
          >
            + Add News
          </Link>
        </div>


        <div className="overflow-x-auto bg-gray-800 rounded-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900 text-left text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <FaSpinner className="animate-spin inline mr-2" />
                    Loading...
                  </td>
                </tr>
              ) : paginatedNews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-400">No news found</td>
                </tr>
              ) : (
                paginatedNews.map((item, idx) => (
                  <tr key={item._id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2">{currentPage * itemsPerPage + idx + 1}</td>
                    <td className="px-4 py-2">{item.title}</td>
                    <td className="px-4 py-2">{item.author}</td>
                    <td className="px-4 py-2">{dayjs(item.date).format('DD/MM/YYYY')}</td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center items-center gap-4">
                        <button
                          onClick={() => {
                            setSelectedNews(item);
                            setModalVisible(true);
                          }}
                          className="text-blue-400 hover:text-blue-600 text-xl"
                          title="View"
                        >
                          <FaEye />
                        </button>

                        <Link
                          to={`/admin/edit-movienews/${item._id}`}
                          className="text-yellow-400 hover:text-yellow-600 text-xl"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>

                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-400 hover:text-red-600 text-xl"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="py-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        <Modal
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={700}
          bodyStyle={{ backgroundColor: '#fff', maxHeight: '70vh', overflowY: 'auto' }}
        >
          {selectedNews && (
            <div className="text-black space-y-4">
              <h3 className="text-xl font-bold">{selectedNews.title}</h3>
              <p className="text-gray-700"><strong>Author:</strong> {selectedNews.author}</p>
              <p className="text-gray-700"><strong>Date:</strong> {dayjs(selectedNews.date).format('DD/MM/YYYY')}</p>
              {selectedNews.image_url && (
                <img src={selectedNews.image_url} alt="News" className="w-full h-64 object-cover rounded shadow" />
              )}
              <p className="text-gray-800">{selectedNews.short_description}</p>
              <div className="text-sm border-t pt-3" dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
            </div>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default MovieNewsList;
