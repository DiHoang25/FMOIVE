import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, InputNumber, Button, message, Spin, Result } from 'antd'; // Import Spin and Result
import SidebarAdmin from '../../components/Sidebar-Admin';
import { motion } from 'framer-motion'; // Import motion for animations
import { FaEdit } from 'react-icons/fa'; // Import FaEdit for the edit icon

const formatCurrency = (value) => {
  return `${value?.toLocaleString('vi-VN')} VND`;
};

const EditCinemaRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    roomName: '',
    rows: 0,
    columns: 0,
    roomType: '',
    normalPrice: 0,
    vipPrice: 0
  });
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [updateLoading, setUpdateLoading] = useState(false); // For update button loading
  const [editStates, setEditStates] = useState({
    normalPrice: false,
    vipPrice: false
  });
  const [fetchError, setFetchError] = useState(''); // To handle errors during initial data fetch
  const [showSuccessModal, setShowSuccessModal] = useState(false); // For success modal

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true); // Start loading
      setFetchError(''); // Clear any previous errors
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setFetchError('Not authenticated. Please log in.');
          setLoading(false);
          navigate('/login');
          return;
        }
        const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setFormValues({
            roomName: data.room.roomName,
            rows: data.room.rows,
            columns: data.room.columns,
            roomType: data.room.roomType,
            normalPrice: data.room.seats.find(s => s.type === 'Normal')?.price || 0,
            vipPrice: data.room.seats.find(s => s.type === 'VIP')?.price || 0
          });
        } else {
          setFetchError(data.message || 'Failed to load room data.');
        }
      } catch (err) {
        setFetchError('Network error or failed to connect to server.');
      } finally {
        setLoading(false); // End loading
      }
    };
    fetchRoom();
  }, [roomId, navigate]);

  const toggleEdit = (field) => {
    setEditStates(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (name, value) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setUpdateLoading(true); // Start update loading
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}/update-prices`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          normalPrice: formValues.normalPrice,
          vipPrice: formValues.vipPrice
        })
      });

      const data = await res.json();
      if (res.ok) {
        setShowSuccessModal(true); // Show success modal
        // Re-fetch data to ensure the displayed values are updated, or directly update state
        // await fetchRoom(); // Consider calling fetchRoom again if the backend sends updated full data
      } else {
        message.error(data.message || 'Update failed.');
      }
    } catch (err) {
      message.error('Network error or failed to connect to server.');
    } finally {
      setUpdateLoading(false); // End update loading
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/admin/cinema-rooms'); // Navigate back to cinema rooms list
  };

  // Render loading state
  if (loading) {
    return (
      <SidebarAdmin>
        <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <Spin size="large" />
        </div>
      </SidebarAdmin>
    );
  }

  // Render error state if fetching failed
  if (fetchError) {
    return (
      <SidebarAdmin>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 flex items-center justify-center">
          <Result status="error" title="Error" subTitle={fetchError} />
        </div>
      </SidebarAdmin>
    );
  }

  return (
    <SidebarAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Edit Cinema Room
              </h1>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div
              className="w-full max-w-4xl mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: '20px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                <div className="space-y-6">

                  {/* Room Name - Non-editable */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <label className="block mb-1 font-medium text-sm text-gray-300">Room Name</label>
                    <div className="flex justify-between items-center bg-slate-900/30 text-white font-medium px-4 py-3 rounded-xl border border-slate-600/30">
                      <span className="break-all text-base">{formValues.roomName}</span>
                    </div>
                  </motion.div>

                  {/* Room Type - Non-editable */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <label className="block mb-1 font-medium text-sm text-gray-300">Room Type</label>
                    <div className="flex justify-between items-center bg-slate-900/30 text-white font-medium px-4 py-3 rounded-xl border border-slate-600/30">
                      <span className="break-all text-base">{formValues.roomType}</span>
                    </div>
                  </motion.div>

                  {/* Rows x Columns - Non-editable */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <label className="block mb-1 font-medium text-sm text-gray-300">Rows x Columns</label>
                    <div className="flex justify-between items-center bg-slate-900/30 text-white font-medium px-4 py-3 rounded-xl border border-slate-600/30">
                      <span className="break-all text-base">{formValues.rows} x {formValues.columns}</span>
                    </div>
                  </motion.div>

                  {/* Normal Seat Price */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                  >
                    <label className="block mb-1 font-medium text-sm text-gray-300">Normal Seat Price</label>
                    {editStates.normalPrice ? (
                      <InputNumber
                        value={formValues.normalPrice}
                        onChange={value => handleChange('normalPrice', value)}
                        min={0}
                        max={1000000}
                        className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-xl border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={value => value.replace(/\./g, '')}
                        controls={false} // Hide Ant Design controls for cleaner look
                      />
                    ) : (
                      <div className="flex justify-between items-center bg-slate-900/30 text-white font-medium px-4 py-3 rounded-xl border border-slate-600/30 transition-all duration-300 hover:scale-[1.01] hover:border-blue-500">
                        <span className="text-base">{formatCurrency(formValues.normalPrice)}</span>
                        <button
                          onClick={() => toggleEdit('normalPrice')}
                          className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300 transition-colors duration-200"
                        >
                          <FaEdit /> Edit
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* VIP Seat Price */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <label className="block mb-1 font-medium text-sm text-gray-300">VIP Seat Price</label>
                    {editStates.vipPrice ? (
                      <InputNumber
                        value={formValues.vipPrice}
                        onChange={value => handleChange('vipPrice', value)}
                        min={0}
                        max={1000000}
                        className="w-full bg-slate-900/50 text-white px-4 py-3 rounded-xl border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        parser={value => value.replace(/\./g, '')}
                        controls={false} // Hide Ant Design controls for cleaner look
                      />
                    ) : (
                      <div className="flex justify-between items-center bg-slate-900/30 text-white font-medium px-4 py-3 rounded-xl border border-slate-600/30 transition-all duration-300 hover:scale-[1.01] hover:border-blue-500">
                        <span className="text-base">{formatCurrency(formValues.vipPrice)}</span>
                        <button
                          onClick={() => toggleEdit('vipPrice')}
                          className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300 transition-colors duration-200"
                        >
                          <FaEdit /> Edit
                        </button>
                      </div>
                    )}
                  </motion.div>

                  {/* Buttons */}
                  <motion.div
                    className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate('/admin/cinema-rooms')}
                      className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition duration-200 text-base font-semibold shadow-md hover:shadow-lg"
                      style={{ height: '48px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={updateLoading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{ height: '48px', borderRadius: '12px' }}
                    >
                      {updateLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 px-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-6 rounded-xl shadow-lg max-w-md w-full"
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Success!</h3>
              <p className="text-gray-300 mb-6 text-sm">Room prices have been updated successfully.</p>
              <button
                onClick={handleSuccessConfirm}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-semibold"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </SidebarAdmin>
  );
};

export default EditCinemaRoom;