// src/pages/__test__/NotFoundPage.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from '../NotFoundPage';

describe('NotFoundPage', () => {
  it('renders the 404 heading', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('renders the "Page Not Found" message', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders the explanation text', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/Sorry, the page you are looking for/i)
    ).toBeInTheDocument();
  });

  it('renders the "Back to Home" link', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );
    const link = screen.getByRole('link', { name: /Back to Home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
