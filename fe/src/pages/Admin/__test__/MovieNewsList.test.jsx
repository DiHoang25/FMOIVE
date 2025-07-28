// MovieNewsList.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MovieNewsList from '../MovieNewsList';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });
});

const mockNews = [
  {
    _id: '1',
    title: 'Test News Title',
    author: 'John Doe',
    date: '2024-07-27T00:00:00.000Z',
    short_description: 'Short desc',
    content: '<p>Full content</p>',
    image_url: 'https://example.com/image.jpg',
  },
];

const renderPage = async () => {
  jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok: true,
    json: async () => mockNews,
  });
  render(
    <BrowserRouter>
      <MovieNewsList />
    </BrowserRouter>
  );
};
describe('MovieNewsList Page', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    it('renders loading spinner initially', async () => {
      jest.spyOn(global, 'fetch').mockImplementation(() => new Promise(() => {})); // never resolves
      render(
        <BrowserRouter>
          <MovieNewsList />
        </BrowserRouter>
      );
      expect(await screen.findByText(/Loading.../i)).toBeInTheDocument();
    });
  
    it('displays movie news data after fetch', async () => {
      await renderPage();
      expect(await screen.findByText('Test News Title')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  
    it('renders "No news found" if list is empty', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });
      render(
        <BrowserRouter>
          <MovieNewsList />
        </BrowserRouter>
      );
      expect(await screen.findByText(/No news found/i)).toBeInTheDocument();
    });
  
  
    it('renders pagination when more than 6 items', async () => {
      const manyNews = Array.from({ length: 8 }, (_, i) => ({
        ...mockNews[0],
        _id: String(i + 1),
        title: `News ${i + 1}`,
      }));
  
      jest.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => manyNews,
      });
  
      render(
        <BrowserRouter>
          <MovieNewsList />
        </BrowserRouter>
      );
  
      expect(await screen.findByText('News 1')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });
  