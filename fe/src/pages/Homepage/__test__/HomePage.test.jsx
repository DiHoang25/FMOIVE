import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import HomePage from '../HomePage';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

// Giả lập axios
jest.mock('axios');

const mockHomeData = {
  banners: ['banner1.jpg'],
  nowShowing: [
    {
      name: 'Now Showing Movie',
      image_url: 'movie.jpg',
      trailer_link: 'https://youtube.com/abc',
    }
  ],
  comingSoon: [],
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

const mockMoviesData = [
  {
    _id: '1',
    name: 'Hot Movie',
    image_url: 'poster.jpg',
    status: 'showing',
    is_hot: true,
    end_date: '2025-08-01',
    genres: ['Action'],
    version: '2D',
    rating: 8.5,
    actors: 'Actor A, B',
    description: 'Awesome movie',
    trailer_link: 'https://youtube.com/trailer',
  }
];

const renderComponent = () => render(
  <BrowserRouter>
    <HomePage />
  </BrowserRouter>
);

describe('HomePage', () => {
  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/home')) return Promise.resolve({ data: mockHomeData });
      if (url.includes('/movies')) return Promise.resolve({ data: mockMoviesData });
    });
  });

  it('renders without crashing and shows banner', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByAltText('Featured Poster')).toBeInTheDocument();
    });
  });

  it('shows now showing movie', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Now Showing Movie')).toBeInTheDocument();
    });
  });

  it('shows actor names and description of hot movie', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Actor A, B/)).toBeInTheDocument();
      expect(screen.getByText(/Awesome movie/)).toBeInTheDocument();
    });
  });

//   it('shows end date of hot movie', async () => {
//     renderComponent();
//     await waitFor(() => {
//       expect(screen.getByText(/2025-08-01/)).toBeInTheDocument(); // nếu được render
//     });
//   });

  it('opens trailer modal on click', async () => {
    renderComponent();
    await waitFor(() => {
      const movie = screen.getByText('Now Showing Movie');
      fireEvent.click(movie);
    });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('displays hot movie', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Hot Movie')).toBeInTheDocument();
      expect(screen.getByText(/IMDB: 8.5/)).toBeInTheDocument();
    });
  });

  it('displays movie news', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Tin hot')).toBeInTheDocument();
    });
  });
});
