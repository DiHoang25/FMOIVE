import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayoutEmployee from '../../components/Sidebar-Employee';
import axios from 'axios';
import prevbanner from '../../assets/prevbanner.png';
import nextbanner from '../../assets/nextbanner.png';

function EmployeeDashboard() {
  const stats = [
    { value: 24, label: 'Total Movies' },
    { value: 18, label: 'Now Showing' },
    { value: 6, label: 'Coming Soon' },
    { value: 156, label: 'Today\'s Shows' }
  ];

  const [comingSoonBanners, setComingSoonBanners] = useState([]);
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/home');
        const comingSoon = res.data.comingSoon || [];
        const bannerList = res.data.banners || [];

        const comingSoonWithBanner = comingSoon
          .filter(movie => movie.banner_url)
          .map(movie => ({
            name: movie.name,
            banner: movie.banner_url
          }));

        setComingSoonBanners(comingSoonWithBanner);
        setBanners(bannerList);
      } catch (err) {
        console.error('❌ Failed to fetch data:', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
        setFade(false);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <SidebarLayoutEmployee>
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4">

            {/* 🎞 Banner section */}
            {banners.length > 0 && (
              <div className="relative w-full h-[300px] mb-8 overflow-hidden rounded-lg shadow-lg bg-black">
                <img
                  src={banners[currentBanner]}
                  alt="Featured Poster"
                  className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}
                />

                <button
                  onClick={() => setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2"
                >
                  <img src={prevbanner} alt="Previous" className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2"
                >
                  <img src={nextbanner} alt="Next" className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {banners.map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${i === currentBanner ? 'bg-red-500' : 'bg-white opacity-50'}`}
                    />
                  ))}
                </div>
              </div>
            )}


            {/* 📊 Stats Cards */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-md text-center">
                  <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* ⚡ Quick Actions */}
            <div className="bg-gray-800 p-4 rounded-md mb-6">
              <h2 className="text-xl text-gray-300 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/employee/add-combo" className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-md text-center">
                  Add Combo Popcorn & Drinks
                </Link>
                <Link to="/employee/add-product" className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-md text-center">
                  Add Products
                </Link>
              </div>
            </div>


          </main>
        </div>
      </div>
    </SidebarLayoutEmployee>
  );
}

export default EmployeeDashboard;
