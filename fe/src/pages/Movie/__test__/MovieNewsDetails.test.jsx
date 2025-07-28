import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MovieNewsDetails from '../MovieNewsDetails';
import { useParams } from 'react-router-dom';

// Mock useParams để cung cấp slug
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

// Giả lập fetch
global.fetch = jest.fn();

describe('MovieNewsDetails', () => {
  const mockData = {
    title: 'Fake News Title',
    image_url: 'http://example.com/image.jpg',
    author: 'Test Author',
    date: '2024-07-20T00:00:00.000Z',
    content: 'This is the first paragraph.\nThis is the second paragraph.',
  };

  beforeEach(() => {
    useParams.mockReturnValue({ slug: 'fake-news-slug' });
    fetch.mockResolvedValueOnce({
      json: async () => mockData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading message initially', () => {
    // Vì fetch là async, nên ban đầu sẽ hiển thị loading
    render(<MovieNewsDetails />);
    expect(screen.getByText(/loading news/i)).toBeInTheDocument();
  });

  test('renders title, image, and content after fetch', async () => {
    render(<MovieNewsDetails />);

    await waitFor(() => {
      expect(screen.getByText('Fake News Title')).toBeInTheDocument();
    });

    expect(screen.getByAltText('Fake News Title')).toHaveAttribute('src', 'http://example.com/image.jpg');
    expect(screen.getByText(/This is the first paragraph/i)).toBeInTheDocument();
    expect(screen.getByText(/This is the second paragraph/i)).toBeInTheDocument();
  });

//   test('renders author and formatted date', async () => {
//     render(<MovieNewsDetails />);

//     await waitFor(() => {
//       expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
//     });

//     expect(screen.getByText(/20\/07\/2024/i)).toBeInTheDocument(); // dd/mm/yyyy format in vi-VN
//   });

  test('handles content split by new lines correctly', async () => {
    render(<MovieNewsDetails />);

    await waitFor(() => {
      const paragraphs = screen.getAllByText(/This is the/i);
      expect(paragraphs.length).toBe(2);
    });
  });
});
