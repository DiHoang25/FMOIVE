import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditMovieNews from '../EditMovieNews';
import { BrowserRouter } from 'react-router-dom';

// Mock Layout
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="sidebar">{children}</div>
));

// Mock useParams and useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'mock-id' }),
  useNavigate: () => jest.fn(),
}));

// Mock dayjs
// jest.mock('dayjs', () => {
//   const actual = jest.requireActual('dayjs');
//   return (value) => (typeof value === 'string' ? actual(value) : actual());
// });

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (url.includes('/api/movie-news/')) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            title: 'Test Title',
            short_description: 'Short Desc',
            content: 'Full Content',
            author: 'Author A',
            date: '2024-01-01',
            image_url: 'http://image.jpg',
          }),
      });
    }
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });
});

const renderPage = () =>
  render(
    <BrowserRouter>
      <EditMovieNews />
    </BrowserRouter>
  );

describe('EditMovieNews Page', () => {
  it('renders loading fields', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Edit Movie News/i)).toBeInTheDocument();
    });
  });


  it('switches title to editable input when Edit is clicked', async () => {
    renderPage();
    const editBtn = await screen.findAllByText('Edit');
    fireEvent.click(editBtn[0]); // First edit is for title
    expect(await screen.findByRole('textbox')).toBeInTheDocument();
  });

  it('displays the date field in read-only initially', async () => {
    renderPage();
    expect(await screen.findByText('2024-01-01')).toBeInTheDocument();
  });

  it('allows switching to date picker', async () => {
    renderPage();
    const editDateBtn = await screen.findAllByText('Edit');
    fireEvent.click(editDateBtn[4]); // date is the 5th field
    expect(await screen.findByRole('textbox')).toBeInTheDocument(); // Antd datepicker renders textbox
  });


  it('shows Cancel and Update buttons', async () => {
    renderPage();
    expect(await screen.findByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update News/i })).toBeInTheDocument();
  });
});
