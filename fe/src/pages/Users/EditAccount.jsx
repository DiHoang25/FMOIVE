import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDashboardLayout from '../../components/UserDashboardlayout';
import avatar from '../../assets/avatar.png';
import { Modal } from 'antd';

const EditAccount = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    dob: '',
    gender: '',
    id_card: '',
    phone: '',
    address: '',
  });
  const [errors, setErrors] = useState({});

  // Fetch user info from backend
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          const u = data.user;
          setFormData({
            fullname: u.fullname || '',
            username: u.username || '',
            email: u.email || '',
            dob: u.dob ? u.dob.split('T')[0] : '',
            gender: u.gender || '',
            id_card: u.id_card || '',
            phone: u.phone || '',
            address: u.address || '',
          });
        } else {
          console.error('Error loading user:', data.message);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = 'Name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    else if (!formData.email.endsWith('@gmail.com')) newErrors.email = 'Email must end with @gmail.com';
    if (!formData.phone) newErrors.phone = 'Phone number is required.';
    if (!formData.id_card) newErrors.id_card = 'ID card is required.';
    if (!formData.address) newErrors.address = 'Address is required.';
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
        setSuccess(true);
      } else {
        console.error('Update failed:', data.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <UserDashboardLayout>
      <div className="bg-[#0a0f1c] text-white p-8 rounded-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-red-600">Edit Account Information</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#121826] p-4 rounded-lg shadow-md flex flex-col items-center">
            <h2 className="font-bold text-2xl mb-4 mt-10 text-red-600">Change Avatar</h2>
            <img src={avatar} alt="avatar" className="w-28 h-28 rounded-full border-4 mb-4" />
            <input type="file" accept="image/png, image/jpeg, image/gif" className="mb-4" />
            <button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold">Save</button>
          </div>

          <div className="md:col-span-2 bg-[#121826] p-6 rounded-lg shadow-md">
            <h2 className="font-bold text-lg mb-4">Information Account</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input name="fullname" placeholder="Full Name" value={formData.fullname} onChange={handleChange}
                    className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                  {errors.fullname && <p className="text-red-500 text-sm mt-1">{errors.fullname}</p>}
                </div>
                <div>
                  <input name="username" disabled value={formData.username}
                    className="bg-gray-200 text-black px-4 py-2 rounded w-full border border-gray-300" />
                </div>
              </div>

              <div>
                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange}
                  className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input name="phone" placeholder="Contact Number" value={formData.phone} onChange={handleChange}
                    className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
                <div>
                  <input name="id_card" placeholder="ID Number" value={formData.id_card} onChange={handleChange}
                    className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                  {errors.id_card && <p className="text-red-500 text-sm mt-1">{errors.id_card}</p>}
                </div>
              </div>

              <div>
                <input name="address" placeholder="Address" value={formData.address} onChange={handleChange}
                  className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input name="dob" type="date" value={formData.dob} onChange={handleChange}
                  className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300" />
                <select name="gender" value={formData.gender} onChange={handleChange}
                  className="bg-white text-black px-4 py-2 rounded w-full border border-gray-300">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="flex justify-center items-center gap-4 mt-6">
                <button onClick={() => navigate('/viewaccount')} className="px-5 py-2 border border-red-500 text-red-500 rounded hover:bg-red-100">Cancel</button>
                <button onClick={handleSave} className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600">Save</button>
              </div>
            </div>
          </div>
        </div>
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
          <p className="text-sm text-gray-600">Your account has been updated successfully.</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded w-full"
          >
            Close
          </button>
        </div>
      </Modal>
    </UserDashboardLayout>
  );
};

export default EditAccount;
