import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import bgImage from '../assets/bg.jpg';
import facebookIcon from '../assets/facebook.png';
import instagramIcon from '../assets/instagram.png';
import twitterIcon from '../assets/twitter.png';
import tiktokIcon from '../assets/social-media.png';

const Footer = () => {
    return (
        <div
            className="text-white py-8 px-4"
            style={{
                backgroundImage: `url(${ bgImage })`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                <div>
                    <h2 className="text-red-500 text-xl font-semibold mb-3">Policies</h2>
                    <ul className="text-base space-y-2">
                        <li>&gt; <Link to="/terms" className="hover:underline text-white">General Terms</Link></li>
                        <li>&gt; <Link to="/payment-policy" className="hover:underline text-white">Payment Policy</Link></li>
                        <li>&gt; <Link to="/delivery-policy" className="hover:underline text-white">Delivery Policy</Link></li>
                        <li>&gt; <Link to="/information-security" className="hover:underline text-white">Information Security</Link></li>
                        <li>&gt; <Link to="/returns-refunds" className="hover:underline text-white">Inspection, Returns/Refunds</Link></li>
                    </ul>

                </div>


                <div>
                    <h2 className="text-red-500 text-xl font-semibold mb-3">Contact Us</h2>
                    <div className="flex space-x-4 text-2xl mb-3">
                        <img
                            src={facebookIcon}
                            alt="Facebook"
                            className="w-8 h-8 object-contain hover:opacity-80 cursor-pointer"
                        />
                        <img
                            src={instagramIcon}
                            alt="Instagram"
                            className="w-8 h-8 object-contain hover:opacity-80 cursor-pointer"
                        />
                        <img
                            src={twitterIcon}
                            alt="Twitter"
                            className="w-8 h-8 object-contain hover:opacity-80 cursor-pointer"
                        />
                        <img
                            src={tiktokIcon}
                            alt="TikTok"
                            className="w-8 h-8 object-contain hover:opacity-80 cursor-pointer"
                        />
                    </div>
                    <ul className="text-base space-y-2">
                        <li>&gt; Support: Support@fpt.edu.vn</li>
                        <li>&gt; Hotline: 1900 1722</li>
                    </ul>
                </div>


                <div className="flex flex-col items-center text-center">
                    <img
                        src={logo}
                        alt="Logo"
                        className="w-40 h-24 object-contain mb-3"
                    />
                    <p className="text-base leading-relaxed">
                        &gt; Address: F-Town 1 Building, High-tech Park,<br />
                        Tan Phu Ward, Thu Duc City, Ho Chi Minh City,<br />
                        Vietnam
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Footer;