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
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Bat Man', image: batman, trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Bat Man', image: batman, trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
];

const moviesComingSoon = [
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Bat Man', image: batman, trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Spider-Man', image: spiderman, trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Bat Man', image: batman, trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Avengers', image: avengers, trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8' },
  { title: 'Cyberpunk', image: cyberpunk, trailer: 'https://www.youtube.com/watch?v=ax5YUmkWf_Y' },
];

const HomePage = () => {
  const [trailerUrl, setTrailerUrl] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [nowShowingIndex, setNowShowingIndex] = useState(0);
  const [comingSoonIndex, setComingSoonIndex] = useState(0);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [fade, setFade] = useState(false);

  const bannerList = [bannerPoster1, bannerPoster2, bannerPoster3, bannerPoster4, bannerPoster5];
  const itemsPerPage = 9;

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentBanner((prev) => (prev + 1) % bannerList.length);
        setFade(false);
      }, 300);
    }, 3000);

    const nowShowingInterval = setInterval(() => {
      setNowShowingIndex((prev) => Math.min(prev + 1, moviesNowShowing.length - itemsPerPage));
    }, 3000);

    const comingSoonInterval = setInterval(() => {
      setComingSoonIndex((prev) => Math.min(prev + 1, moviesComingSoon.length - itemsPerPage));
    }, 3000);

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

  const renderSlidingMovieList = (movies, index, setIndex) => {
    const maxIndex = movies.length - itemsPerPage;
    const visible = movies.slice(index, index + itemsPerPage);

    return (
      <div className="space-y-4 overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 220}px)` }}
        >
          {movies.map((movie, i) => (
            <div
              key={i}
              className="relative w-[200px] mx-2 flex-shrink-0 cursor-pointer group"
              onClick={() => openTrailer(movie.trailer)}
            >
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-[350px] object-cover rounded shadow-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition duration-200">
                <img src={buttonplay} alt="Play" className="w-10 h-10 object-contain" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-4 mt-2">
          <button
            onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
            disabled={index === 0}
            className="disabled:opacity-30"
          ><div className="bg-red-600 rounded-full p-1 hover:bg-red-700 transition"><img
            src={prevbanner}
            alt="Prev"
            className="w-7 h-7 object-contain"
          /></div></button>
          <button
            onClick={() => setIndex((prev) => Math.min(prev + 1, maxIndex))}
            disabled={index >= maxIndex}
            className="disabled:opacity-30"
          ><div className="bg-red-600 rounded-full p-1 hover:bg-red-700 transition"><img
            src={nextbanner}
            alt="Next"
            className="w-7 h-7 object-contain"
          /></div></button>
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
          className={`w-full h-full object-cover transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'}`}
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



      <div className="mt-10"> <h2 className="text-xl font-bold mb-4"> Hot movie : <span className="text-red-500">May 2025</span> </h2>
        {moviesNowShowing.slice(0, 4).map((movie, idx) => (
          <div key={idx} className="flex items-start gap-4 mb-6 border-b border-gray-700 pb-4">
            <img src={movie.image} alt="Poster" className="w-[200px] h-[340px] object-cover rounded" />
            <div>
              <h3 className="text-3xl font-bold text-red-500">{movie.title}</h3>
              <div className="flex items-center gap-3 text-sm font-medium mb-1">
                <span className='text-xl'>Action/Sci-Fi</span>
                <span className="bg-white text-black px-1 rounded text-m">2D</span>
                <span className="bg-red-600 text-white px-1 rounded text-m">16+</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400 mb-2">
                {'★'.repeat(4)}{'☆'} <span className="text-white text-m ml-2">(8.2 / 10)</span>
              </div>
              <p className="text-xl text-gray-300 mb-2">
                Now showing • Ends: 30 May 2025
              </p>
              <p className="text-2xl mb-2">
                Actor: Tom Holland, Zendaya, Benedict Cumberbatch,...
              </p>
              <p className="text-2xl mb-2">
                Description: “The Amazing Spider-Man” is an action-adventure film about Peter Parker becoming a superhero to fight crime.
              </p>
              <div className="mb-2">
                <button onClick={() => openTrailer(movie.trailer)} className="bg-gray-800 text-white px-5 py-2 rounded text-2m ml-0">
                  Watch trailer
                </button>
              </div>
              <Link to="/moviedetails">
                <button className="bg-red-600 text-white px-3 py-1 rounded text-xl">View Details</button>
              </Link>
            </div>
          </div>
        ))}

      </div>


      <div className="mt-10">
        <h2 className="text-xl font-bold mb-6">
          Movie News</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-8 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((_, idx) =>
          (<Link to="/movienews"
            key={idx}
            className="bg-white text-black rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition duration-300" >
            <img src={avengers} alt="News" className="w-full h-[300px] object-cover" />
            <div className="p-4 space-y-2">
              <h3 className="text-lg font-semibold leading-tight line-clamp-2"> Final Part of Avengers's univer </h3>
              <div className="flex items-center text-sm text-gray-500 gap-4">
                <span className="flex items-center gap-1"> <span role="img" aria-label="admin">
                  👤</span>
                  admin </span>
                <span className="flex items-center gap-1">
                  <span role="img" aria-label="calendar">📅
                  </span> 13/05/2025 </span> </div>
              <p className="text-sm text-gray-700 line-clamp-3">
                "Avengers End Game: is a last part of Avenger's univer which has 3 hours,... </p> </div> </Link>))} </div> </div>


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