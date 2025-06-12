import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Link } from 'react-router-dom';
import ReactPlayer from 'react-player/youtube';
import spiderman from '../../assets/spider-man.jpg';
import avengers from '../../assets/avengers.jpg';
import buttonplay from '../../assets/play-button.png';
import batman from '../../assets/batman.png';
import cyberpunk from '../../assets/cyberpunk.png';
import bannerPoster3 from '../../assets/banner1.jpg';
import bannerPoster2 from '../../assets/banner2.png';
import bannerPoster4 from '../../assets/banner3.jpg';
import bannerPoster1 from '../../assets/banner4.jpg';
import bannerPoster5 from '../../assets/banner5.jpg';
import nextbanner from '../../assets/nextbanner.png';
import prevbanner from '../../assets/prevbanner.png';

const moviesNowShowing = [
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Bat Man', image: batman, trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Bat Man', image: batman, trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
];

const moviesComingSoon = [
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Bat Man', image: batman, trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Bat Man', image: batman, trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
];

const HomePage = () => {
  const [trailerUrl, setTrailerUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nowShowingIndex, setNowShowingIndex] = useState(0);
  const [comingSoonIndex, setComingSoonIndex] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);

  const bannerList = [bannerPoster1, bannerPoster2, bannerPoster3, bannerPoster4, bannerPoster5];
  const itemsPerPage = 5;

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerList.length);
    }, 4000);

    const nowShowingInterval = setInterval(() => {
      setNowShowingIndex((prev) => Math.min(prev + 1, moviesNowShowing.length - itemsPerPage));
    }, 5000);

    const comingSoonInterval = setInterval(() => {
      setComingSoonIndex((prev) => Math.min(prev + 1, moviesComingSoon.length - itemsPerPage));
    }, 6000);

    return () => {
      clearInterval(bannerInterval);
      clearInterval(nowShowingInterval);
      clearInterval(comingSoonInterval);
    };
  }, []);

  const openTrailer = (url) => {
    setTrailerUrl(url);
    setIsModalVisible(true);
  };

  const closeTrailer = () => {
    setIsModalVisible(false);
    setTrailerUrl('');
  };

  const renderSlidingMovieList = (movies, index, setIndex, nextArrow, prevArrow) => {
    const maxIndex = movies.length - itemsPerPage;
    const visible = movies.slice(index, index + itemsPerPage);
  
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4 transition-all duration-500 ease-in-out">
            {visible.map((movie, i) => (
              <div
                key={i}
                className="relative cursor-pointer group"
                onClick={() => openTrailer(movie.trailer)}
              >
                <img
                  src={movie.image}
                  alt={movie.title}
                  className="w-full h-[500px] object-cover rounded shadow-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                  <img src={buttonplay} alt="Play" className="w-10 h-10 object-contain" />
                </div>
              </div>
            ))}
          </div>
  
          {/* Arrow controls */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10">
            <button
              onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
              disabled={index === 0}
              className="disabled:opacity-30"
            >
              <img src={prevbanner} alt="prev" className="w-8 h-8" />
            </button>
          </div>
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10">
            <button
              onClick={() => setIndex((prev) => Math.min(prev + 1, maxIndex))}
              disabled={index >= maxIndex}
              className="disabled:opacity-30"
            >
              <img src={nextbanner} alt="next" className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black text-white px-6 py-10 space-y-10">
      <div className="relative w-full h-[800px] mb-6 overflow-hidden rounded-lg shadow-lg">
        <img
          src={bannerList[currentBanner]}
          alt="Featured Poster"
          className="w-full h-full object-cover"
        />
        <button onClick={() => setCurrentBanner((prev) => (prev + 1) % bannerList.length)} className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <img src={nextbanner} alt="Next" className="w-8 h-8" />
        </button>
        <button onClick={() => setCurrentBanner((prev) => (prev === 0 ? bannerList.length - 1 : prev - 1))} className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <img src={prevbanner} alt="Previous" className="w-8 h-8" />
        </button>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerList.map((_, i) => (
            <div key={i} className={`w-3 h-3 rounded-full ${i === currentBanner ? 'bg-red-500' : 'bg-white opacity-50'}`} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">The movie : <span className="text-red-500">Currently showing</span></h2>
        {renderSlidingMovieList(moviesNowShowing, nowShowingIndex, setNowShowingIndex)}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">The movie : <span className="text-orange-400">Coming soon</span></h2>
        {renderSlidingMovieList(moviesComingSoon, comingSoonIndex, setComingSoonIndex)}
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Hot movie : <span className="text-red-500">May 2025</span></h2>

        {[1, 2, 3, 4].map((_, idx) => (
          <div key={idx} className="flex items-start gap-4 mb-6 border-b border-gray-700 pb-4">
            <img src={spiderman} alt="Poster" className="w-[200px] h-[340px] object-cover rounded" />
            <div>
              <h3 className="text-2xl font-bold text-red-500">The Amazing Spider-Man</h3>
              <div className="flex items-center gap-3 text-sm font-medium mb-1">
                <span className='text-xl'>Action/Sci-Fi</span>
                <span className="bg-white text-black px-1 rounded text-m">2D</span>
                <span className="bg-red-600 text-white px-1 rounded text-m">16+</span>
              </div>
              <p className="text-2xl mb-2">
                Description: “The Amazing Spider-Man” is an action-adventure film about Peter Parker becoming a superhero to fight crime.
              </p>
              <Link to="/moviedetails">
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xl">Movie Details</button>
              </Link>
            </div>
          </div>
        ))}
      </div>


      <div>
        <h2 className="text-xl font-bold mb-4">Movie News</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((_, idx) => (
            <Link to="/movienews" key={idx} className="bg-white text-black rounded overflow-hidden shadow">
              <img src={cyberpunk} alt="News" className="w-full h-[900px] object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-xl">Cyberpunk: Edgrunner</h3>
                <p className="text-xl">Description: Stunning trailer reveals mind-bending sci-fi plot with action and mystery.</p>
              </div>
            </Link>
          ))}
        </div>
      </div>


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
