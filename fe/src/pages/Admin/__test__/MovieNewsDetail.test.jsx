import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import MovieNewsDetails from '../MovieNewsDetails';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Enable fetch mocking
beforeEach(() => {
  fetch.resetMocks();
});

const mockNews = {
  title: 'Big Blockbuster News!',
  image_url: 'http://image.test/news.jpg',
  author: 'Cinema Admin',
  date: '2024-07-15T00:00:00.000Z',
  content: 'Paragraph one.\nParagraph two.\n\nParagraph three.',
};

const renderWithRouter = (slug = 'big-blockbuster') =>
  render(
    <MemoryRouter initialEntries={[`/news/${slug}`]}>
      <Routes>
        <Route path="/news/:slug" element={<MovieNewsDetails />} />
      </Routes>
    </MemoryRouter>
  );

describe('MovieNewsDetails', () => {
  it('renders loading state initially', () => {
    fetch.mockResponseOnce(JSON.stringify(mockNews));
    renderWithRouter();
    expect(screen.getByText(/Loading news/i)).toBeInTheDocument();
  });


  it('renders fallback author if missing', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        ...mockNews,
        author: null,
      })
    );
    renderWithRouter();
    expect(await screen.findByText(/Unknown/i)).toBeInTheDocument();
  });

  it('splits content into multiple paragraphs', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockNews));
    renderWithRouter();

    const paras = await screen.findAllByText(/Paragraph/i);
    expect(paras.length).toBe(3);
    expect(paras[0]).toHaveTextContent('Paragraph one.');
    expect(paras[1]).toHaveTextContent('Paragraph two.');
    expect(paras[2]).toHaveTextContent('Paragraph three.');
  });

  it('handles fetch failure gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    fetch.mockReject(() => Promise.reject('API down'));

    renderWithRouter();
    expect(await screen.findByText(/Loading news/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });
    consoleSpy.mockRestore();
  });
});
