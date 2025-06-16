import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Input } from 'antd';
import spiderman from '../../assets/spider-man.jpg';
import avengers from '../../assets/avengers.jpg';
import batman from '../../assets/batman.png';
import cyberpunk from '../../assets/cyberpunk.png';
import Pagination from '../../components/PaginationHomepage';

// Sử dụng data tương tự như trong Homepage nhưng thêm một số thông tin
const allMovies = [
  {
    id: 1,
    title: 'The Dark Knight',
    image: batman,
    trailer: 'https://www.youtube.com/watch?v=oz7wymKGzOU',
    rating: 9.0,
    duration: '152 min',
    format: 'Action/Crime',
    releaseDate: '2008/07/18',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
  },
  {
    id: 2,
    title: 'The Amazing Spider-Man',
    image: spiderman,
    trailer: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
    rating: 7.5,
    duration: '136 min',
    format: 'Action/Sci-Fi',
    releaseDate: '2012/07/03',
    description: 'After Peter Parker is bitten by a genetically altered spider, he gains newfound, spider-like powers and ventures out to save the city from the machinations of a mysterious reptilian foe.'
  },
  {
    id: 3,
    title: 'The Avengers',
    image: avengers,
    trailer: 'https://www.youtube.com/watch?v=eOrNdBpGMv8',
    rating: 8.0,
    duration: '143 min',
    format: 'Action/Sci-Fi',
    releaseDate: '2012/05/04',
    description: 'Earth\'s mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.'
  },
  {
    id: 4,
    title: 'The Conjuring',
    image: cyberpunk, // Thay bằng ảnh thích hợp khi có
    trailer: 'https://www.youtube.com/watch?v=k10ETZ41q5o',
    rating: 7.5,
    duration: '112 min',
    format: 'Horror',
    releaseDate: '2013/07/19',
    description: 'Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.'
  },
  {
    id: 5,
    title: 'The Karate Kid',
    image: avengers, // Thay bằng ảnh thích hợp khi có
    trailer: 'https://www.youtube.com/watch?v=XY8amUImEu0',
    rating: 7.2,
    duration: '140 min',
    format: 'Action/Drama',
    releaseDate: '2010/06/11',
    description: 'Work causes a single mother to move to China with her young son; in his new home, the boy embraces kung fu, taught to him by a master.'
  },
  {
    id: 6,
    title: 'The Matrix',
    image: batman, // Thay bằng ảnh thích hợp khi có
    trailer: 'https://www.youtube.com/watch?v=vKQi3bBA1y8',
    rating: 8.7,
    duration: '136 min',
    format: 'Action/Sci-Fi',
    releaseDate: '1999/03/31',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.'
  },
  {
    id: 7,
    title: 'Batman Begins',
    image: batman,
    trailer: 'https://www.youtube.com/watch?v=neY2xVmOfUM',
    rating: 8.2,
    duration: '140 min',
    format: 'Action/Adventure',
    releaseDate: '2005/06/15',
    description: 'After training with his mentor, Batman begins his fight to free crime-ridden Gotham City from corruption.'
  },
  {
    id: 8,
    title: 'Spider-Man: Homecoming',
    image: spiderman,
    trailer: 'https://www.youtube.com/watch?v=n9DwoQ7HWvI',
    rating: 7.4,
    duration: '133 min',
    format: 'Action/Adventure',
    releaseDate: '2017/07/07',
    description: 'Peter Parker balances his life as an ordinary high school student in Queens with his superhero alter-ego Spider-Man, and finds himself on the trail of a new menace prowling the skies of New York City.'
  },
  {
    id: 9,
    title: 'Avengers: Endgame',
    image: avengers,
    trailer: 'https://www.youtube.com/watch?v=TcMBFSGVi1c',
    rating: 8.4,
    duration: '181 min',
    format: 'Action/Sci-Fi',
    releaseDate: '2019/04/26',
    description: 'After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos\' actions and restore balance to the universe.'
  },
  {
    id: 10,
    title: 'The Dark Knight Rises',
    image: batman,
    trailer: 'https://www.youtube.com/watch?v=GokKUqLcvD8',
    rating: 8.4,
    duration: '165 min',
    format: 'Action/Adventure',
    releaseDate: '2012/07/20',
    description: 'Eight years after the Joker\'s reign of anarchy, Batman, with the help of the enigmatic Catwoman, is forced from his exile to save Gotham City from the brutal guerrilla terrorist Bane.'
  },
  // Thêm 5 phim nữa để có 2 hàng
  {
    id: 11,
    title: 'Inception',
    image: batman, // Sử dụng ảnh đã có
    trailer: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    rating: 8.8,
    duration: '148 min',
    format: 'Sci-Fi/Action',
    releaseDate: '2010/07/16',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
  },
  {
    id: 12,
    title: 'Interstellar',
    image: avengers, // Sử dụng ảnh đã có
    trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    rating: 8.6,
    duration: '169 min',
    format: 'Sci-Fi/Adventure',
    releaseDate: '2014/11/07',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.'
  },
  {
    id: 13,
    title: 'The Lord of the Rings',
    image: spiderman, // Sử dụng ảnh đã có
    trailer: 'https://www.youtube.com/watch?v=V75dMMIW2B4',
    rating: 8.9,
    duration: '178 min',
    format: 'Adventure/Fantasy',
    releaseDate: '2001/12/19',
    description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.'
  },
  {
    id: 14,
    title: 'Joker',
    image: cyberpunk, // Sử dụng ảnh đã có
    trailer: 'https://www.youtube.com/watch?v=zAGVQLHvwOY',
    rating: 8.4,
    duration: '122 min',
    format: 'Crime/Drama',
    releaseDate: '2019/10/04',
    description: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society. He then embarks on a downward spiral of revolution and bloody crime. This path brings him face-to-face with his alter-ego: the Joker.'
  },
  {
    id: 15,
    title: 'Dune',
    image: batman, // Sử dụng ảnh đã có
    trailer: 'https://www.youtube.com/watch?v=n9xhJrPXop4',
    rating: 8.0,
    duration: '155 min',
    format: 'Sci-Fi/Adventure',
    releaseDate: '2021/10/22',
    description: 'Feature adaptation of Frank Herbert\'s science fiction novel, about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.'
  }
];

const MovieSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMovies, setFilteredMovies] = useState(allMovies);
  const [currentPage, setCurrentPage] = useState(0); // Bắt đầu từ 0 để phù hợp với PaginationHomepage
  const moviesPerPage = 10; // Hiển thị 10 phim mỗi trang (2 hàng x 5 phim)
  
  // Xử lý khi thay đổi ô input - cập nhật kết quả ngay lập tức
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setFilteredMovies(allMovies);
    } else {
      const results = allMovies.filter(movie => 
        movie.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMovies(results);
    }
    setCurrentPage(0); // Reset về trang 0 khi thay đổi kết quả tìm kiếm
  };

  // Phân trang
  const indexOfLastMovie = (currentPage + 1) * moviesPerPage;
  const indexOfFirstMovie = currentPage * moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirstMovie, indexOfLastMovie);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-black text-white min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Movie Search</h1>
        
        {/* Search bar */}
        <div className="flex mb-10 max-w-xl mx-auto">
          <Input
            placeholder="The..."
            value={searchTerm}
            onChange={handleInputChange}
            className="rounded-md p-2 h-12 flex-grow"
            style={{ backgroundColor: '#1a1a2e', color: 'white', borderColor: '#333' }}
          />
        </div>
        
        {/* Movie grid */}
        {filteredMovies.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {currentMovies.map((movie) => (
                <div key={movie.id} className="relative cursor-pointer group">
                  <img 
                    src={movie.image} 
                    alt={movie.title} 
                    className="w-full h-[500px] object-cover rounded shadow-lg"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-3">
                    <h2 className="text-lg font-bold text-white truncate">{movie.title}</h2>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-400">{movie.rating.toFixed(1)}</span>
                      <span className="text-xs text-gray-300">{movie.duration}</span>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <Link to="/moviedetails" className="w-full">
                        <button className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-2 rounded">
                          View Details
                        </button>
                      </Link>
                    </div>
                  
                  </div>
                </div>
              ))}
            </div>

            {/* Sử dụng component Pagination từ PaginationHomepage */}
            {filteredMovies.length > moviesPerPage && (
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl">No movies found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSearch;