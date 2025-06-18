// src/data/movieData.js

export const getMoviesFromLocalStorage = () => {
    const data = localStorage.getItem('movie-list');
    return data ? JSON.parse(data) : [];
  };
  