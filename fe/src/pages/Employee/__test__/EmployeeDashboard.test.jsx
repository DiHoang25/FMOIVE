import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import EmployeeDashboard from '../EmployeeDashboard';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';


jest.mock('axios');


jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div data-testid="sidebar-layout">{children}</div>);


jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const mockDayjs = (date) => {
    const dayjsObj = originalDayjs(date);
    return {
      ...dayjsObj,
      isAfter: jest.fn((compareDate) => dayjsObj.isAfter(compareDate)),
      isBefore: jest.fn((compareDate) => dayjsObj.isBefore(compareDate)),
    };
  };
  return mockDayjs;
});

describe('EmployeeDashboard', () => {
  beforeEach(() => {
    
    jest.clearAllMocks();

    
    jest.spyOn(console, 'error').mockImplementation(() => {});

    
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/movies')) {
        return Promise.resolve({
          data: [
            { 
              _id: '1', 
              name: 'Test Movie 1', 
              start_date: new Date(Date.now() - 86400000).toISOString(), 
              end_date: new Date(Date.now() + 86400000).toISOString(),   
              createdAt: new Date().toISOString()
            },
            {
              _id: '2',
              name: 'Test Movie 2',
              start_date: new Date(Date.now() + 86400000 * 7).toISOString(), 
              end_date: new Date(Date.now() + 86400000 * 14).toISOString(),   
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      if (url.includes('/api/home')) {
        return Promise.resolve({
          data: {
            banners: ['banner1.jpg', 'banner2.jpg'],
            comingSoon: [
              { name: 'Coming Soon Movie', banner_url: 'coming-soon.jpg' }
            ]
          }
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    
    console.error.mockRestore();
  });

  test('renders dashboard with stats and banner', async () => {
    await act(async () => {
      render(
        <MemoryRouter>
          <EmployeeDashboard />
        </MemoryRouter>
      );
    });

    
    expect(screen.getByTestId('sidebar-layout')).toBeInTheDocument();

    
    await waitFor(() => {
      
      expect(screen.getByText('Total Movies')).toBeInTheDocument();
      expect(screen.getByText('Now Showing')).toBeInTheDocument();
      expect(screen.getByText('Coming Soon')).toBeInTheDocument();
    });

    
    expect(screen.getByText('Booking List')).toBeInTheDocument();
    expect(screen.getByText('Show Time')).toBeInTheDocument();

    
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/movies');
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/home');
  });

  test('handles API error gracefully', async () => {
    
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    await act(async () => {
      render(
        <MemoryRouter>
          <EmployeeDashboard />
        </MemoryRouter>
      );
    });

    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    
    
    expect(axios.get).toHaveBeenCalledWith('http://localhost:5000/api/home');
  });
});