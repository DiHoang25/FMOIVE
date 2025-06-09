import React, { useState, useEffect } from 'react';
import bgImage from '../assets/bg.jpg';
import logo from '../assets/logo.png';
import user from '../assets/user.png';

const NotificationBar = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('token');
        if (isLoggedIn) {
            setVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div
            className="flex flex-col justify-center items-center fixed top-0 left-0 right-0 z-50 shadow-lg px-4 text-white space-y-2"
            style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '60px',
            }}
        >

            <div className="grid grid-cols-6 gap-2 items-center px-4">
                {/* Logo chiếm 1 cột */}
                <div className="col-span-1">
                    <img
                        src={logo}
                        alt="Logo"
                        style={{ height: '50px', objectFit: 'contain' }}
                    />
                </div>

                {/* FAQ chiếm 2 cột */}
                <div className="col-span-2">
                    <a
                        href="/faq"
                        className="text-xl font-semibold text-white hover:underline"
                    >
                        FAQ's
                    </a>
                </div>

                {/* User icon chiếm 1 cột */}
                <div className="col-span-1 flex justify-center">
                    <img
                        src={user}
                        alt="User Icon"
                        style={{ height: '40px', width: '40px', objectFit: 'contain' }}
                    />
                </div>

                {/* Login button chiếm 2 cột */}
                <div className="col-span-2 flex justify-end">
                    <button
                        className="bg-red-600 px-4 py-2 rounded text-white text-sm hover:bg-red-700"
                        style={{ border: '2px solid white' }}
                    >
                        Login
                    </button>
                </div>
            </div>

        </div>
    );
};

export default NotificationBar;