
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HomePage from '../HomePage';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock axios
jest.mock('axios');

// Mock dữ liệu cho endpoint /home
const mockHomeData = {
  banners: ['banner1.jpg'],
  news: [
    {
      title: 'Tin hot',
      image_url: 'news.jpg',
      slug: 'tin-hot',
      author: 'Admin',
      date: '2025-07-01',
      short_description: 'Mô tả...',
    }
  ]
};

// Mock dữ liệu cho endpoint /movies
const mockMoviesData = [
  {
    _id: '1',
    name: 'Now Showing Movie',
    image_url: 'now_showing_movie.jpg', // Dùng ảnh riêng để getByAltText không bị trùng
    trailer_link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    is_hot: false,
    start_date: '2025-07-01',
    end_date: '2025-08-31', // Ngày kết thúc để phim ở trạng thái 'now_showing'
    genres: ['Action'],
    version: '2D',
    actors: 'Actor X, Y',
    description: 'A thrilling action movie.',
  },
  {
    _id: '2',
    name: 'Hot Movie',
    image_url: 'hot_movie.jpg',
    is_hot: true,
    start_date: '2025-06-01',
    end_date: '2025-08-01', // Ngày kết thúc của phim hot đang được test
    genres: ['Action'],
    version: '2D',
    actors: 'Actor A, B',
    description: 'Awesome movie',
    trailer_link: 'https://www.youtube.com/watch?v=another_trailer_id',
  },
  {
    _id: '3',
    name: 'Coming Soon Movie',
    image_url: 'coming_soon_movie.jpg',
    is_hot: false,
    start_date: '2025-09-01',
    end_date: '2025-10-01',
    genres: ['Drama'],
    version: '2D',
    actors: 'Actor C, D',
    description: 'Upcoming movie',
    trailer_link: 'https://www.youtube.com/watch?v=yet_another_trailer_id',
  }
];

// Hàm helper để render component trong BrowserRouter
const renderComponent = () => render(
  <BrowserRouter>
    <HomePage />
  </BrowserRouter>
);

// Mock IntersectionObserver vì nó được dùng trong Ant Design's Modal nhưng không có trong môi trường JSDOM
beforeAll(() => {
  global.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };
});


describe('HomePage', () => {
  beforeEach(() => {
    // Reset mock trước mỗi test
    axios.get.mockClear();
    // Cấu hình mock axios để trả về dữ liệu giả
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/home')) {
        return Promise.resolve({ data: mockHomeData });
      }
      if (url.includes('/api/movies')) {
        return Promise.resolve({ data: mockMoviesData });
      }
      return Promise.reject(new Error('not found'));
    });

    // Giả lập kích thước cửa sổ cho responsive
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
    window.dispatchEvent(new Event('resize'));
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('render component mà không bị lỗi và hiển thị banner', async () => {
    renderComponent();
    // Chờ cho đến khi banner được render
    expect(await screen.findByAltText('Featured Poster')).toBeInTheDocument();
  });

  it('hiển thị phim đang chiếu', async () => {
    renderComponent();
    // Chờ cho đến khi tên phim xuất hiện trong document
    expect(await screen.findByText('Now Showing Movie')).toBeInTheDocument();
  });

  it('hiển thị phim sắp chiếu', async () => {
    renderComponent();
    expect(await screen.findByText('Coming Soon Movie')).toBeInTheDocument();
  });

  // --- TEST CASE ĐÃ SỬA ---
  it('hiển thị tên diễn viên và mô tả của phim hot', async () => {
    renderComponent();
    await waitFor(() => {
      // SỬA LỖI: Tìm kiếm văn bản có chứa cả tiền tố "Actor: " và "Description: "
      expect(screen.getByText('Actor: Actor A, B')).toBeInTheDocument();
      expect(screen.getByText('Description: Awesome movie')).toBeInTheDocument();
    });
  });

  // --- TEST CASE ĐÃ SỬA ---
  it('hiển thị ngày kết thúc của phim hot', async () => {
    renderComponent();
    await waitFor(() => {
      // SỬA LỖI: Dùng regex để khớp với chuỗi con thay vì chuỗi chính xác.
      // Component render "Now showing • Ends: 01/08/2025"
      // Hàm formatDate('2025-08-01') trả về '01/08/2025'
      expect(screen.getByText(/Ends: 01\/08\/2025/)).toBeInTheDocument();
    });
  });

  // --- TEST CASE ĐÃ SỬA ---
  it('mở modal trailer khi click vào poster phim đang chiếu', async () => {
    renderComponent();
    
    // SỬA LỖI: Tìm và click vào phần tử poster (thông qua alt text của ảnh) thay vì text bị ẩn
    const moviePoster = await screen.findByAltText('Now Showing Movie');
    // Click vào thẻ cha của ảnh, vì thẻ cha mới có sự kiện onClick
    fireEvent.click(moviePoster.parentElement);

    // Chờ modal và player xuất hiện
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeInTheDocument();

    // ReactPlayer thường render một iframe với title này
    expect(await screen.findByTitle('YouTube video player')).toBeInTheDocument();
  });

  it('hiển thị phim hot đang chiếu', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Hot Movie')).toBeInTheDocument();
      expect(screen.getByText(/Action/)).toBeInTheDocument();
      expect(screen.getByText(/2D/)).toBeInTheDocument();
    });
  });

  it('không hiển thị phim đã kết thúc trong danh sách phim hot', async () => {
    const endedHotMovie = {
      _id: '4',
      name: 'Ended Hot Movie',
      image_url: 'poster3.jpg',
      is_hot: true,
      start_date: '2025-01-01',
      end_date: '2025-02-01', // Phim đã kết thúc
      genres: ['Action'],
      version: '2D',
      actors: 'Actor E, F',
      description: 'Ended movie',
      trailer_link: 'https://www.youtube.com/watch?v=another_ended_trailer',
    };

    // Ghi đè mock axios cho test case này
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/home')) return Promise.resolve({ data: mockHomeData });
      if (url.includes('/api/movies')) return Promise.resolve({ data: [...mockMoviesData, endedHotMovie] });
      return Promise.reject(new Error('not found'));
    });

    renderComponent();
    await waitFor(() => {
      // Phim hot còn hạn vẫn hiển thị
      expect(screen.getByText('Hot Movie')).toBeInTheDocument();
      // Phim hot đã hết hạn không được hiển thị
      expect(screen.queryByText('Ended Hot Movie')).not.toBeInTheDocument();
    });
  });

  it('hiển thị tin tức phim', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Tin hot')).toBeInTheDocument();
      expect(screen.getByText('Mô tả...')).toBeInTheDocument();
    });
  });
});
