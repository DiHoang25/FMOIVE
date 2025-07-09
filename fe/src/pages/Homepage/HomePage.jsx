import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';
import buttonplay from '../../assets/play-button.png';
import nextbanner from '../../assets/nextbanner.png';
import prevbanner from '../../assets/prevbanner.png';
import axios from 'axios';

const HomePage = () => {
  const [trailerUrl, setTrailerUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [hotMovies, setHotMovies] = useState([]);
  const [banners, setBanners] = useState([]);
  const [news, setNews] = useState([]);
  const [nowShowingIndex, setNowShowingIndex] = useState(0);
  const [comingSoonIndex, setComingSoonIndex] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [fade, setFade] = useState(false);
  const currentDate = new Date();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const month = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();


  const itemsPerPage = 7;

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [homeRes, moviesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/home'),
          axios.get('http://localhost:5000/api/movies')
        ]);

        const homeData = homeRes.data;
        const moviesData = moviesRes.data;

        // Filter out ended movies for hot movies section
        const activeMovies = moviesData.filter(movie => movie.status !== 'ended' && movie.is_hot);

        setBanners(homeData.banners || []);
        setNowShowingMovies(homeData.nowShowing || []);
        setComingSoonMovies(homeData.comingSoon || []);
        setHotMovies(activeMovies);
        setNews(homeData.news || []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      }
    };
    fetchHomeData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  };

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
        setFade(false);
      }, 300);
    }, 3000);

    let nowShowingInterval = null;
    let comingSoonInterval = null;
    if (nowShowingMovies.length > itemsPerPage) {
      nowShowingInterval = setInterval(() => {
        setNowShowingIndex((prev) => {
          const maxIndex = nowShowingMovies.length - itemsPerPage;
          return prev < maxIndex ? prev + 1 : prev;
        });
      }, 3000);
    }

    if (comingSoonMovies.length > itemsPerPage) {
comingSoonInterval = setInterval(() => {
        setComingSoonIndex((prev) => {
          const maxIndex = comingSoonMovies.length - itemsPerPage;
          return prev < maxIndex ? prev + 1 : prev;
        });
      }, 3000);
    }

    return () => {
      clearInterval(bannerInterval);
      if (nowShowingInterval) clearInterval(nowShowingInterval);
      if (comingSoonInterval) clearInterval(comingSoonInterval);
    };
  }, [banners.length, nowShowingMovies.length, comingSoonMovies.length]);

  const openTrailer = (url) => {
    setTrailerUrl(url);
    setIsModalVisible(true);
  };

  const closeTrailer = () => {
    setIsModalVisible(false);
    setTrailerUrl('');
  };

  const renderSlidingMovieList = (movies, index, setIndex) => {
    const itemWidth = 220;
    const visibleCount = itemsPerPage;
    const totalMovies = movies.length;
    const containerWidth = itemWidth * visibleCount;

    // Tính max index sao cho không tạo khoảng trống
    const maxIndex = Math.max(totalMovies - visibleCount, 0);

    // Giới hạn index thủ công (tránh vượt)
    const clampedIndex = Math.min(index, maxIndex);

    return (
      <div className="space-y-4 overflow-hidden">
        {/* Movie List */}
        <div className="overflow-hidden w-full">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              width: `${itemWidth * totalMovies}px`,
              transform: `translateX(-${clampedIndex * itemWidth}px)`,
            }}
          >
            {movies.map((movie, i) => (
              <div
                key={i}
                className="relative w-[200px] mx-2 flex-shrink-0 cursor-pointer group"
                onClick={() => openTrailer(movie.trailer_link)}
              >
                <img
                  src={movie.image_url}
                  alt={movie.name}
                  className="w-full h-[320px] object-cover rounded shadow-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                  <img src={buttonplay} alt="Play" className="w-10 h-10 object-contain" />
                </div>
                <div className="absolute bottom-0 w-full bg-black bg-opacity-80 text-white text-center text-sm py-1 opacity-0 group-hover:opacity-100 transition duration-200">
                  {movie.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center items-center gap-4 mt-2">
          <button
            onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
            disabled={clampedIndex === 0}
            className="disabled:opacity-30"
          >
            <div className="bg-red-600 rounded-full p-1 hover:bg-red-700 transition">
<img src={prevbanner} alt="Prev" className="w-7 h-7 object-contain" />
            </div>
          </button>
          <button
            onClick={() => setIndex((prev) => Math.min(prev + 1, maxIndex))}
            disabled={clampedIndex >= maxIndex}
            className="disabled:opacity-30"
          >
            <div className="bg-red-600 rounded-full p-1 hover:bg-red-700 transition">
              <img src={nextbanner} alt="Next" className="w-7 h-7 object-contain" />
            </div>
          </button>
        </div>
      </div>
    );
  };




  return (
    <div className="bg-black text-white px-6 py-10 space-y-10">
      {/* Banner section */}
      <div className="relative w-full h-[800px] mb-6 overflow-hidden rounded-lg shadow-lg">
        {banners.length > 0 && (
          <img
            src={banners[currentBanner]}
            alt="Featured Poster"
            className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}
          />
        )}
        <button onClick={() => setCurrentBanner((prev) => (prev + 1) % banners.length)} className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <img src={nextbanner} alt="Next" className="w-8 h-8" />
        </button>
        <button onClick={() => setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))} className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <img src={prevbanner} alt="Previous" className="w-8 h-8" />
        </button>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {banners.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i === currentBanner ? 'bg-red-500' : 'bg-white opacity-50'}`} />
          ))}
        </div>
      </div>

      {/* Now Showing */}
      <div>
        <h2 className="text-xl font-semibold mb-4">The movie : <span className="text-red-500">Now showing</span></h2>
        {renderSlidingMovieList(nowShowingMovies, nowShowingIndex, setNowShowingIndex)}
      </div>

      {/* Coming Soon */}
      <div>
        <h2 className="text-xl font-semibold mb-4">The movie : <span className="text-orange-400">Coming soon</span></h2>
        {renderSlidingMovieList(comingSoonMovies, comingSoonIndex, setComingSoonIndex)}
      </div>

      {/* Hot Movies */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">
          Hot movie : <span className="text-red-500">{month} {year}</span>
        </h2>
        {hotMovies.slice(0, 8).map((movie, idx) => (
          <div key={idx} className="flex items-start gap-4 mb-6 border-b border-gray-700 pb-4">
            <Link to={`/moviedetails/${movie._id}`}>
              <img src={movie.image_url} alt="Poster" className="w-[200px] h-[340px] object-cover rounded" />
            </Link>
            <div>
              <h3 className="text-3xl font-bold text-red-500">{movie.name}</h3>
<div className="flex items-center gap-3 text-sm font-medium mb-1">
                <span className='text-xl'>{movie.genres?.join(', ') || 'N/A'}</span>
                <span className="bg-red-600 text-b  lack px-1 rounded text-m">{movie.version}</span>
                {/* <span className="bg-red-600 text-white px-1 rounded text-m">{movie.rating}</span> */}
              </div>
              <div className="flex items-center gap-1 text-yellow-400 mb-2">
                <span className="text-white text-m">IMDB: {movie.rating}/10</span>
              </div>
              <p className="text-xl text-gray-300 mb-2">Now showing • Ends: {formatDate(movie.end_date)}</p>
              <p className="text-2xl mb-2">Actor: {movie.actors || 'N/A'}</p>
              <p className="text-2xl mb-2">Description: {movie.description || 'N/A'}</p>
              <div className="mb-2">
                <button onClick={() => openTrailer(movie.trailer_link)} className="bg-gray-800 text-white px-2 py-1 rounded text-xl ml-0">
                  Watch Trailer
                </button>
              </div>
              <Link to={`/moviedetails/${movie._id}`}>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xl">View Details</button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Movie News */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-6">Movie News</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {news.map((item, idx) => (
            <Link
              to={`/movienews/${item.slug}`}
              key={idx}
              className="bg-white text-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300"
            >
              <img src={item.image_url} alt="News" className="w-full h-[300px] object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-semibold leading-tight line-clamp-2">{item.title}</h3>
                <div className="flex items-center text-sm text-gray-500 gap-4">
                  <span className="flex items-center gap-1">👤 {item.author}</span>
                </div>
                <span className="text-xs flex items-center gap-1">📅 {item.date}</span>
                <p className="text-sm text-gray-700 line-clamp-3">{item.short_description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>


      {/* Modal Trailer */}
      <Modal
        open={isModalVisible}
        onCancel={closeTrailer}
        footer={null}
        centered
        width={800}
        className="backdrop-blur-sm"
        destroyOnClose
        styles={{
          content: {
            backgroundColor: 'transparent',
            borderRadius: 0,
            boxShadow: 'none',
            padding: 0,
          },
          body: { padding: 0 },
        }}
      >
        <div className="relative pb-[56.25%] h-0">
{isModalVisible && (
            <ReactPlayer
              key={trailerUrl}
              url={trailerUrl}
              playing
              controls
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default HomePage;