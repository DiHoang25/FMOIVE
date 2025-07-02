import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk để tìm kiếm phim từ API
export const searchMovies = createAsyncThunk(
  'movieSearch/searchMovies',
  async (searchParams, { rejectWithValue }) => {
    try {
      // Xây dựng URL với tham số tìm kiếm
      const { search, date } = searchParams;
      let url = 'http://localhost:5000/api/feature/search?';
      
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (date) url += `date=${encodeURIComponent(date)}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Không thể tìm kiếm phim');
      }
      
      const data = await response.json();
      return data.movies; // API trả về { message, movies }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk để lấy tất cả phim
export const fetchAllMovies = createAsyncThunk(
  'movieSearch/fetchAllMovies',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/api/movies');
      
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách phim');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Hàm để escape các ký tự đặc biệt trong biểu thức chính quy
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const movieSearchSlice = createSlice({
  name: 'movieSearch',
  initialState: {
    movies: [],
    filteredMovies: [],
    loading: false,
    error: null,
    searchTerm: '',
    currentPage: 0,
  },
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      // Lọc phim theo searchTerm từ danh sách đã có
      if (!state.searchTerm.trim()) {
        state.filteredMovies = state.movies;
      } else {
        try {
          const escapedSearchTerm = escapeRegExp(state.searchTerm);
          const searchRegex = new RegExp(escapedSearchTerm, 'i');
          state.filteredMovies = state.movies.filter(movie =>
            searchRegex.test(movie.name)
          );
        } catch (error) {
          // Fallback khi RegExp thất bại - tìm kiếm đơn giản hơn
          state.filteredMovies = state.movies.filter(movie =>
            movie.name.toLowerCase().includes(state.searchTerm.toLowerCase())
          );
        }
      }
      state.currentPage = 0; // Reset về trang đầu tiên
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Xử lý searchMovies
      .addCase(searchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload;
        state.filteredMovies = action.payload;
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Xử lý fetchAllMovies
      .addCase(fetchAllMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.movies = action.payload;
        state.filteredMovies = action.payload;
      })
      .addCase(fetchAllMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setCurrentPage } = movieSearchSlice.actions;
export default movieSearchSlice.reducer;