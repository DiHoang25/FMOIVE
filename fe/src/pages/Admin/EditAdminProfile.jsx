import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Import motion for animations
import SidebarLayout from '../../components/Sidebar-Admin';
import { FaEdit } from 'react-icons/fa'; // Keep FaEdit for the edit icon
import {
  Result, // For error display, similar to AdminProfile
  Spin, // For loading state, similar to AdminProfile
} from 'antd'; // Import Ant Design components as needed

const EditAdminProfile = () => {
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    date_of_birth: '',
    gender: '',
    phone: '',
  });
  const [editStates, setEditStates] = useState({
    fullname: false,
    email: false,
    phone: false,
    date_of_birth: false,
    gender: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state
  const [fetchError, setFetchError] = useState(''); // Add fetch error state

  // Function to toggle edit mode for a specific field
  const toggleEdit = (field) => {
    setEditStates((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Function to fetch user data from the backend
  const fetchUserData = async () => {
    setLoading(true); // Set loading to true before fetching
    setFetchError(''); // Clear any previous fetch errors
    const token = localStorage.getItem('token');
    if (!token) {
      setFetchError('Not authenticated. Please log in.');
      setLoading(false);
      navigate('/login'); // Redirect to login if no token
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const u = data.user;
        setFormData({
          fullname: u.fullname || '',
          username: u.username || '',
          email: u.email || '',
          date_of_birth: u.date_of_birth ? u.date_of_birth.split('T')[0] : '', // Format for input type="date"
          gender: u.gender || '',
          phone: u.phone || '',
        });
      } else {
        console.error('Error loading user:', data.message);
        setFetchError(data.message || 'Failed to load profile data.');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setFetchError('Network error or failed to connect to server.');
    } finally {
      setLoading(false); // Set loading to false after fetch attempt
    }
  };

  // Function to format ISO date string to DD/MM/YYYY
  const formatDate = (isoString) => {
    if (!isoString) return 'Not provided';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error when input changes
  };

  // Validate form fields
  const validate = () => {
    const newErrors = {};
    if (!formData.fullname.trim()) newErrors.fullname = 'Full Name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format.';
    else if (!formData.email.endsWith('@gmail.com')) newErrors.email = 'Email must end with @gmail.com';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    else if (!/^\d{10,15}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10-15 digits.';
    return newErrors;
  };

  // Handle saving the updated profile
  const handleSave = async () => {
    const foundErrors = validate();
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchUserData(); // Re-fetch data to display updated info
        setShowSuccessModal(true); // Show success modal
      } else {
        console.error('Update failed:', data.message);
        setErrors({ general: data.message || 'Failed to update profile.' }); // Set general error
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Network error or failed to connect to server.' }); // Set general error
    }
  };

  // Handle confirmation from success modal
  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/admin/admin-profile'); // Navigate back to profile page
  };

  // Render loading state
  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex justify-center items-center min-h-[70vh] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
          <Spin size="large" />
        </div>
      </SidebarLayout>
    );
  }

  // Render error state if fetching failed
  if (fetchError) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6 flex items-center justify-center">
          <Result status="error" title="Error" subTitle={fetchError} />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Edit Admin Profile
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
                {errors.general && (
                  <p className="text-red-500 text-center mb-4 text-sm md:text-base">{errors.general}</p>
                )}

                <div className="space-y-6">
                  {/* Editable Fields */}
                  {[
                    { label: 'Username', name: 'username', editable: false }, // Username is not editable
                    { label: 'Full Name', name: 'fullname', editable: true },
                    { label: 'Email', name: 'email', editable: true },
                    { label: 'Phone Number', name: 'phone', editable: true },
                  ].map(({ label, name, editable }) => (
                    <motion.div
                      key={name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * (['fullname', 'email', 'phone'].indexOf(name) + 1) }}
                    >
                      <label className="block mb-1 font-medium text-sm text-gray-300">{label}</label>
                      {editable && editStates[name] ? (
                        <>
                          <input
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                          />
                          {errors[name] && (
                            <p className="text-red-400 text-sm mt-1">{errors[name]}</p>
                          )}
                        </>
                      ) : (
                        <div className="flex justify-between items-center bg-slate-900/30 text-white font-medium px-4 py-3 rounded-xl border border-slate-600/30 transition-all duration-300 hover:scale-[1.01] hover:border-blue-500">
                          <span className="break-all text-base">{name === 'username' ? `@${formData[name]}` : formData[name]}</span>
                          {editable && (
                            <button
                              onClick={() => toggleEdit(name)}
                              className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300 transition-colors duration-200"
                            >
                              <FaEdit /> Edit
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* Date of Birth & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* DOB */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * 4 }}
                    >
                      <label className="block mb-1 font-medium text-sm text-gray-300">Date of Birth</label>
                      {editStates.date_of_birth ? (
                        <input
                          name="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={handleChange}
                          className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                        />
                      ) : (
                        <div className="flex justify-between items-center bg-slate-900/30 text-white font-medium px-4 py-3 rounded-xl border border-slate-600/30 transition-all duration-300 hover:scale-[1.01] hover:border-blue-500">
                          <span className="text-base">{formatDate(formData.date_of_birth)}</span>
                          <button
                            onClick={() => toggleEdit('date_of_birth')}
                            className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300 transition-colors duration-200"
                          >
                            <FaEdit /> Edit
                          </button>
                        </div>
                      )}
                    </motion.div>

                    {/* Gender */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * 5 }}
                    >
                      <label className="block mb-1 font-medium text-sm text-gray-300">Gender</label>
                      {editStates.gender ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                        >
                          <option value="" className="bg-slate-800 text-white">Select Gender</option>
                          <option value="male" className="bg-slate-800 text-white">Male</option>
                          <option value="female" className="bg-slate-800 text-white">Female</option>
                          <option value="other" className="bg-slate-800 text-white">Other</option>
                        </select>
                      ) : (
                        <div className="flex justify-between items-center bg-slate-900/30 text-white font-medium px-4 py-3 rounded-xl border border-slate-600/30 transition-all duration-300 hover:scale-[1.01] hover:border-blue-500">
                          <span className="text-base">{formData.gender || 'Not provided'}</span>
                          <button
                            onClick={() => toggleEdit('gender')}
                            className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300 transition-colors duration-200"
                          >
                            <FaEdit /> Edit
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Buttons */}
                  <motion.div
                    className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                  >
                    <button
                      onClick={() => navigate('/admin/admin-profile')}
                      className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition duration-200 text-base font-semibold shadow-md hover:shadow-lg"
                      style={{ height: '48px' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{ height: '48px', borderRadius: '12px' }}
                    >
                      Save Changes
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
              <p className="text-gray-300 mb-6 text-sm">Your account has been updated successfully.</p>
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
    </SidebarLayout>
  );
};

export default EditAdminProfile;
