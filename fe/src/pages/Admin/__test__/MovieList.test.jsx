import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MovieList from '../MovieList';
import { BrowserRouter } from 'react-router-dom';

// Mock layout
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock Pagination
jest.mock('../../../components/PaginationHomepage', () => ({ currentPage, totalPages, onPageChange }) => (
  <div data-testid="pagination">
    Page: {currentPage + 1} / {totalPages}
    <button onClick={() => onPageChange(currentPage - 1)}>Prev</button>
    <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
  </div>
));

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({
    data: [
      {
        _id: '1',
        name: 'Inception',
        genres: ['Action', 'Sci-Fi'],
        running_time: 120,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        version: '2D',
        director: 'Nolan',
        actors: 'Leonardo Dicaprio',
        production_company: 'WB',
        trailer_link: 'https://trailer.com',
        description: 'A mind-bending movie',
        image_url: 'http://image.jpg',
        banner_url: 'http://banner.jpg',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ]
  })),
  delete: jest.fn(() => Promise.resolve({ status: 200 }))
}));

const renderPage = () => render(
  <BrowserRouter>
    <MovieList />
  </BrowserRouter>
);

describe('MovieList Page', () => {
    it('renders loading initially', () => {
      renderPage();
      expect(screen.getByText(/Loading movies/i)).toBeInTheDocument();
    });
  
    it('shows movie status as Now Showing', async () => {
      renderPage();
      expect(await screen.findByText(/Now Showing/i)).toBeInTheDocument();
    });
      
    
    it('shows "No movies found" if search returns empty', async () => {
      renderPage();
      const input = await screen.findByPlaceholderText(/Search movie/i);
      fireEvent.change(input, { target: { value: 'no-match' } });
      await waitFor(() => {
        expect(screen.getByText(/No movies found/i)).toBeInTheDocument();
      });
    });
    
  
    // it('renders pagination and can change pages', async () => {
    //   renderPage();
    //   expect(await screen.findByTestId('pagination')).toBeInTheDocument();
    //   fireEvent.click(screen.getByText('Next'));
    //   fireEvent.click(screen.getByText('Prev'));
    // });
  
    // it('deletes a movie and removes it from the table', async () => {
    //   renderPage();
    //   await waitFor(() => screen.getByText('Inception'));
    //   const trashBtn = screen.getAllByRole('button')[2]; // trash is 3rd icon
    //   fireEvent.click(trashBtn);
  
    //   // Simulate confirm manually
    //   await waitFor(() => {
    //     expect(trashBtn).toBeInTheDocument();
    //   });
    // });
  
    // it('navigates to edit page via edit button', async () => {
    //   renderPage();
    //   const editBtn = await screen.findAllByRole('button');
    //   expect(editBtn[1].outerHTML).toContain('yellow'); // FaEdit icon
    // });
  });
  