import React from 'react';
import UserDashboardLayout from '../../components/UserDashboardlayout';
import avatar from '../../assets/avatar.png'; // avatar mặc định
import { useNavigate } from 'react-router-dom';

const ViewAccount = () => {
    const navigate = useNavigate();

    return (
        <UserDashboardLayout>
            <div className="bg-[#0a0f1c] text-white py-10 px-6 rounded-md min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-5xl bg-[#121826] p-8 rounded-xl shadow-lg">
                    {/* Avatar và Tên */}
                    <div className=" justify-center flex flex-col items-center" style={{ marginLeft: '250px' }}>
                        <img src={avatar} alt="Avatar" className="w-32 h-32 rounded-full mb-3 border-4 " />
                        <h2 className="text-2xl font-bold mb-2">Mr.T</h2>
                        <button
                            onClick={() => navigate('/editaccount')}
                            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition font-semibold"
                        >
                            Edit Profile
                        </button>
                    </div>

                    {/* Thông tin người dùng */}
                    <div className="text-left text-base space-y-2">
                        <h1 className="text-3xl font-bold mb-4 text-red-600">Information Account</h1>
                        <p><span className="font-semibold text-white">Name:</span> Mr.T</p>
                        <p><span className="font-semibold text-white">Account:</span> mrt1288</p>
                        <p><span className="font-semibold text-white">Email:</span> mrt1288@gmail.com</p>
                        <p><span className="font-semibold text-white">DOB:</span> 12/04/2000</p>
                        <p><span className="font-semibold text-white">Address:</span> Thu Duc Ward, Ho Chi Minh city</p>
                        <p><span className="font-semibold text-white">ID number:</span> 0123456789</p>
                        <p><span className="font-semibold text-white">Phone number:</span> 0123456789</p>
                        <p><span className="font-semibold text-white">Point:</span> 1000</p>
                        <p><span className="font-semibold text-white">Membership:</span> Gold</p>
                    </div>
                </div>
            </div>
        </UserDashboardLayout>
    );
};

export default ViewAccount;