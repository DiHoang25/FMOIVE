import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayoutEmployee from '../../components/Sidebar-Employee';
import { FaEdit } from 'react-icons/fa';

const EditEmProfile = () => {
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

  const toggleEdit = (field) => {
    setEditStates((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
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
          date_of_birth: u.date_of_birth ? u.date_of_birth.split('T')[0] : '',
          gender: u.gender || '',
          phone: u.phone || '',
        });
      } else {
        console.error('Error loading user:', data.message);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = 'Name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!formData.email.endsWith('@gmail.com')) newErrors.email = 'Email must end with @gmail.com';
    if (!formData.phone) newErrors.phone = 'Phone number is required.';
    return newErrors;
  };

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
        await fetchUserData();
        setShowSuccessModal(true);
      } else {
        console.error('Update failed:', data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false);
    navigate('/employee/employee-profile');
  };

  return (
    <SidebarLayoutEmployee>
      <div className="text-white py-8 px-4 sm:px-6 rounded-md min-h-screen flex justify-center items-start">
        <div className="w-full max-w-3xl bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-white">Edit Profile</h1>

          <div className="space-y-6">
            {/* Các trường editable */}
            {[
              { label: 'Username', name: 'username', editable: false },
              { label: 'Full Name', name: 'fullname', editable: true },
              { label: 'Email', name: 'email', editable: true },
              { label: 'Phone', name: 'phone', editable: true },
            ].map(({ label, name, editable }) => (
              <div key={name}>
                <label className="block mb-1 font-medium text-sm text-gray-300">{label}</label>
                {editable && editStates[name] ? (
                  <>
                    <input
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300 text-sm"
                    />
                    {errors[name] && (
                      <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between items-center bg-white text-black font-medium px-3 py-2 rounded text-sm">
                    <span className="break-all">{formData[name]}</span>
                    {editable && (
                      <button
                        onClick={() => toggleEdit(name)}
                        className="text-gray-500 text-sm flex items-center gap-1"
                      >
                        <FaEdit /> Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Date of Birth & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* DOB */}
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-300">Date of Birth</label>
                {editStates.date_of_birth ? (
                  <input
                    name="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300 text-sm"
                  />
                ) : (
                  <div className="flex justify-between items-center bg-white text-black font-medium px-3 py-2 rounded text-sm">
                    <span>{formData.date_of_birth ? formatDate(formData.date_of_birth) : ''}</span>
                    <button
                      onClick={() => toggleEdit('date_of_birth')}
                      className="text-gray-500 text-sm flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-1 font-medium text-sm text-gray-300">Gender</label>
                {editStates.gender ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300 text-sm"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                ) : (
                  <div className="flex justify-between items-center bg-white text-black font-medium px-3 py-2 rounded text-sm">
                    <span>{formData.gender}</span>
                    <button
                      onClick={() => toggleEdit('gender')}
                      className="text-gray-500 text-sm flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-center sm:justify-end gap-3 mt-6">
              <button
                onClick={() => navigate('/employee/employee-profile')}
                className="w-full sm:w-auto px-6 py-2 border border-red-500 text-red-500 rounded hover:bg-red-100 transition duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition duration-200 text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 px-4">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Success</h3>
              <p className="text-gray-300 mb-6 text-sm">Your account has been updated successfully.</p>
              <button
                onClick={handleSuccessConfirm}
                className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-200 text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </SidebarLayoutEmployee>
  );
};

export default EditEmProfile;
