import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MovieSearch from '../MovieSearch';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import movieSearchReducer from '../../../redux/movieSearchSlice';

const createTestStore = (preloadedState) => {
  return configureStore({
    reducer: {
      movieSearch: movieSearchReducer,
    },
    preloadedState,
  });
};

const renderWithProvider = (store) =>
  render(
    <Provider store={store}>
      <BrowserRouter>
        <MovieSearch />
      </BrowserRouter>
    </Provider>
  );

describe('MovieSearch component tests', () => {
  it('renders loading when loading is true', () => {
    const store = createTestStore({
      movieSearch: {
        movies: [],
        filteredMovies: [],
        loading: true,
        error: null,
        searchTerm: '',
        currentPage: 1,
      },
    });

    renderWithProvider(store);
    expect(screen.getByText(/đang tải dữ liệu phim/i)).toBeInTheDocument();
  });

  it('does not show pagination when only one page of results', () => {
    const movies = Array.from({ length: 4 }, (_, i) => ({
      _id: String(i + 1),
      name: `Movie ${i + 1}`,
      image_url: 'https://example.com/img.jpg',
      description: 'Sample',
    }));

    const store = createTestStore({
      movieSearch: {
        movies,
        filteredMovies: movies,
        loading: false,
        error: null,
        searchTerm: '',
        currentPage: 1,
      },
    });

    renderWithProvider(store);

    expect(screen.queryByText(/2/i)).not.toBeInTheDocument();
  });

  // ✅ NEW TESTS BELOW

  it('renders title "Movie Search"', () => {
    const store = createTestStore({
      movieSearch: {
        movies: [],
        filteredMovies: [],
        loading: false,
        error: null,
        searchTerm: '',
        currentPage: 1,
      },
    });

    renderWithProvider(store);
    expect(screen.getByRole('heading', { name: /movie search/i })).toBeInTheDocument();
  });
});
