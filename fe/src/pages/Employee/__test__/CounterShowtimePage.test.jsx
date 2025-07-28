import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import CounterShowtimesPage from '../CounterShowtimePage';


jest.mock('axios');


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));


const mockDispatch = jest.fn();
jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: jest.fn(() => ({})),
}));


jest.mock('../../../redux/bookingSlice', () => ({
  setSelectedSeats: jest.fn(() => ({ type: 'setSelectedSeats' })),
  setMovieAndDateTime: jest.fn((data) => ({ type: 'setMovieAndDateTime', payload: data })),
}));


jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div data-testid="sidebar-layout">{children}</div>);

describe('CounterShowtimesPage', () => {
  beforeEach(() => {
    
    jest.clearAllMocks();
    mockNavigate.mockReset();
    mockDispatch.mockReset();
    
    
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    
    const mockMovies = [
      {
        _id: '1',
        name: 'Test Movie 1',
        image_url: 'test-image1.jpg',
        genres: ['Action', 'Drama'],
        running_time: 120,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000 * 7).toISOString(),
        showtimes: ['10:00 AM', '1:00 PM', '4:00 PM'],
        cinema_room: 'room1',
        is_deleted: false,
        version: '2D',
        production_company: 'Test Studio',
        director: 'Test Director',
        actors: ['Actor 1', 'Actor 2'],
        rating: 'PG-13',
        description: 'Test movie description'
      }
    ];

  
    axios.get.mockImplementation((url) => {
      if (url === 'http://localhost:5000/api/movies') {
        return Promise.resolve({ data: mockMovies });
      } else if (url.includes('/api/movies/')) {
        const movieId = url.split('/').pop();
        const movie = mockMovies.find(m => m._id === movieId);
        return Promise.resolve({ data: movie });
      }
      return Promise.reject(new Error('Not found'));
    });
  });
  
  afterEach(() => {
  
    console.error.mockRestore();
  });

  test('renders loading state initially', async () => {
    
    axios.get.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => {
        resolve({ data: [] });
      }, 100))
    );
    
    render(
      <MemoryRouter>
        <CounterShowtimesPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading movies...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading movies...')).not.toBeInTheDocument();
    });
  });

  test('renders movies and showtimes after loading', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CounterShowtimesPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });

    expect(screen.getByText(/Genre:/)).toBeInTheDocument();
    expect(screen.getByText(/Duration:/)).toBeInTheDocument();
    
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('1:00 PM')).toBeInTheDocument();
    expect(screen.getByText('4:00 PM')).toBeInTheDocument();
    
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/movies');
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/movies/1');
  });

  test('handles empty movies array', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    await act(async () => {
      render(
        <MemoryRouter>
          <CounterShowtimesPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('No movies available for today.')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(
        <MemoryRouter>
          <CounterShowtimesPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch movie details.')).toBeInTheDocument();
    });
    
    expect(console.error).toHaveBeenCalled();
  });

  test('selects a showtime when clicked', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <CounterShowtimesPage />
        </MemoryRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Test Movie 1')).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText('10:00 AM'));
    });

    expect(screen.getByText('10:00 AM').closest('button')).toHaveClass('bg-yellow-500');
    
    expect(mockDispatch).toHaveBeenCalled();
    
    expect(mockNavigate).toHaveBeenCalledWith(
      '/employee/counter-seat/room1',
      expect.objectContaining({
        state: expect.objectContaining({
          selectedMovieId: '1',
          selectedShowtimeTime: '10:00 AM',
        })
      })
    );
  });
});