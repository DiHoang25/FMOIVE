import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayoutEmployee from '../../components/Sidebar-Employee';
import axios from 'axios';
import prevbanner from '../../assets/prevbanner.png';
import nextbanner from '../../assets/nextbanner.png';
import dayjs from 'dayjs';

function EmployeeDashboard() {
  const [movies, setMovies] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [nowShowing, setNowShowing] = useState(0);
  const [comingSoon, setComingSoon] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies');
        const sortedMovies = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMovies(sortedMovies);

        const today = dayjs();
        setTotalMovies(sortedMovies.length);
        setNowShowing(sortedMovies.filter(movie => {
          const start = dayjs(movie.start_date);
          const end = dayjs(movie.end_date);
          return today.isAfter(start) && today.isBefore(end);
        }).length);
        setComingSoon(sortedMovies.filter(movie => dayjs(movie.start_date).isAfter(today)).length);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovies();
  }, []);

  const stats = [
    { value: totalMovies, label: 'Total Movies' },
    { value: nowShowing, label: 'Now Showing' },
    { value: comingSoon, label: 'Coming Soon' },
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
              <div className="relative w-full h-[200px] md:h-[240px] lg:h-[360px] mb-8 overflow-hidden rounded-lg shadow-lg bg-black">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className={`rounded-lg p-4 text-center shadow ${i === 0 ? 'bg-gray-700' : i === 1 ? 'bg-red-700' : i === 2 ? 'bg-yellow-600' : 'bg-blue-600'
                    }`}
                >
                  <p className="text-sm text-white">{stat.label}</p>
                  <h2 className="text-xl font-bold text-white">{stat.value}</h2>
                </div>
              ))}
            </div>

            {/* ⚡ Quick Actions */}
            <div className="bg-gray-800 p-4 rounded-md mb-6">
              <h2 className="text-xl text-gray-300 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/employee/counter-booking-list" className="bg-green-500 hover:bg-green-600 text-white hover:text-white p-3 rounded-md text-center">
                  Booking List
                </Link>
                <Link to="/employee/counter-showtimes" className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white p-3 rounded-md text-center">
                  Show Time
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
