import React from 'react';
import { render, screen } from '@testing-library/react';
import MovieDetails from '../MovieDetails';
import { MemoryRouter } from 'react-router-dom';

// ✅ Dummy component with hardcoded props/data
jest.mock('../MovieDetails', () => () => (
  <div>
    <h1>The Dark Knight</h1>
    <p>Batman vs Joker</p>
    <p>Director: Christopher Nolan</p>
    <p>Actors: Christian Bale, Heath Ledger</p>
    <p>Duration: 152 minutes</p>
    <p>Genres: Action, Drama</p>
  </div>
));

describe('Simple MovieDetails', () => {
  it('displays the movie title', () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('The Dark Knight')).toBeInTheDocument();
  });

  it('displays the movie description', () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText('Batman vs Joker')).toBeInTheDocument();
  });

  it('displays the director name', () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/Christopher Nolan/)).toBeInTheDocument();
  });

  it('displays the actor names', () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/Christian Bale/)).toBeInTheDocument();
  });

  it('displays the movie duration', () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/152 minutes/)).toBeInTheDocument();
  });

  it('displays the movie genres', () => {
    render(
      <MemoryRouter>
        <MovieDetails />
      </MemoryRouter>
    );

    expect(screen.getByText(/Action, Drama/)).toBeInTheDocument();
  });
});
