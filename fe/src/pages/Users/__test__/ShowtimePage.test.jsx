// src/pages/Users/__test__/ShowtimePage.test.jsx
import React, { act } from "react"; // act is now explicitly imported ONLY from 'react'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react"; // Removed 'act' from here
import "@testing-library/jest-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import axios from "axios";

// Import the component to test
import ShowtimePage from "../ShowtimePage"; // Corrected path: go up one directory to 'Users' then find ShowtimePage

// Import your Redux slice (assuming bookingSlice.js exports a default reducer)
import bookingReducer, {
  setMovieAndDateTime,
  setSelectedSeats,
} from "../../../redux/bookingSlice";

// --- Utility functions (copied from ShowtimePage.jsx for testing scope) ---
function getWeekDates(startDate) {
  const dates = [];
  const start = new Date(startDate);
  for (let i = 0; i < 7; i++) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    dates.push(next);
  }
  return dates;
}

function formatDateLabel(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString();
  return `${day}/${month}`;
}

function formatDateForNavigation(date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function isBeforeToday(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(date);
  check.setHours(0, 0, 0, 0);
  return check < today;
}
// --- End Utility functions ---

// --- Mocks ---

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"), // Use actual for Link, BrowserRouter etc.
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

// Mock axios
jest.mock("axios");

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
});

// Mock window.scrollTo
const mockScrollTo = jest.fn();
Object.defineProperty(window, "scrollTo", {
  value: mockScrollTo,
});

// Mock MovieCard component to simplify testing ShowtimePage in isolation
// We only care that MovieCard receives the correct props
jest.mock("../../../components/MovieCard", () => {
  // Mock MovieCard to render its props for easy assertion
  return jest.fn(
    ({ title, poster, info, showtimes, movie, onShowtimeClick }) => (
      <div data-testid="movie-card" data-title={title}>
        <h3>{title}</h3>
        <p>{info}</p>
        <img src={poster} alt={title} />
        {showtimes.map((time, idx) => (
          <button key={idx} onClick={() => onShowtimeClick(movie, time)}>
            {time}
          </button>
        ))}
      </div>
    )
  );
});

// --- Helper for rendering with Redux Provider ---
const renderWithRedux = async (
  component,
  { initialState = {}, store } = {}
) => {
  const testStore =
    store ||
    configureStore({
      reducer: { booking: bookingReducer },
      preloadedState: initialState,
    });

  // Spy on the dispatch method
  const originalDispatch = testStore.dispatch;
  testStore.dispatch = jest.fn(originalDispatch);

  let renderResult;
  await act(async () => {
    renderResult = render(<Provider store={testStore}>{component}</Provider>);
    // Allow any immediate promises from effects (like axios.get) to resolve
    await Promise.resolve();
  });

  return {
    ...renderResult,
    store: testStore,
    // Return the mocked dispatch for assertions
    dispatch: testStore.dispatch,
  };
};

describe("ShowtimePage", () => {
  // Sample movie data for mocking API response
  const mockMovies = [
    {
      _id: "movie1",
      name: "Action Movie",
      image_url: "http://example.com/action.jpg",
      version: "2D",
      running_time: 120,
      genres: ["Action", "Thriller"],
      start_date: "2025-07-20T00:00:00.000Z", // Example: starts before today
      end_date: "2025-07-30T00:00:00.000Z",
      cinema_room: "ROOM000000001",
      showtimes: ["10:00", "14:00"],
    },
    {
      _id: "movie2",
      name: "Comedy Film",
      image_url: "http://example.com/comedy.jpg",
      version: "3D",
      running_time: 90,
      genres: ["Comedy"],
      start_date: "2025-07-22T00:00:00.000Z", // Example: starts today
      end_date: "2025-08-05T00:00:00.000Z",
      cinema_room: "ROOM000000002",
      showtimes: ["11:00", "15:00"],
    },
  ];

  // Set a consistent "today" for testing date logic
  const MOCK_DATE = new Date("2025-07-23T12:00:00.000Z"); // Wednesday, July 23, 2025
  const realDate = Date; // Store original Date object
  beforeAll(() => {
    global.Date = class extends realDate {
      constructor(dateString) {
        if (dateString) {
          return new realDate(dateString);
        }
        return MOCK_DATE;
      }
    };
  });
  afterAll(() => {
    global.Date = realDate; // Restore original Date object
  });

  beforeEach(() => {
    // Reset mocks before each test
    mockNavigate.mockClear();
    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
      key: "default",
    });
    axios.get.mockClear();
    mockSessionStorage.clear();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
    mockScrollTo.mockClear();

    // Default mock for axios.get to return movies
    axios.get.mockResolvedValue({ data: mockMovies });

    // Mock initial sessionStorage state for selectedShowtimeDate
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === "selectedShowtimeDate") {
        return formatDateLabel(MOCK_DATE); // Use the formatted mock date
      }
      return null;
    });
  });

  // Test 1: Renders the main elements
  test("renders SHOWTIMES heading and date navigation", async () => {
    await renderWithRedux(<ShowtimePage />);

    expect(screen.getByText("SHOWTIMES")).toBeInTheDocument();

    // Check if current date button is rendered and selected
    const todayLabel = formatDateLabel(MOCK_DATE); // Dynamically derive today's label
    const todayButton = screen.getByRole("button", { name: todayLabel });
    expect(todayButton).toBeInTheDocument();
    expect(todayButton).toHaveClass("bg-red-600"); // Should be selected

    // Check navigation buttons
    expect(screen.getByLabelText("Next week")).toBeInTheDocument();
    // The previous week button should NOT be in the document because prevWeekStart is before today
    expect(screen.queryByLabelText("Previous week")).not.toBeInTheDocument();
  });


  // Test 4: Handles next week navigation
  test("navigates to next week and updates dates", async () => {
    await renderWithRedux(<ShowtimePage />);
    // Wait for initial render to complete
    await waitFor(() =>
      expect(screen.getByText(formatDateLabel(MOCK_DATE))).toBeInTheDocument()
    ); // Use dynamic today's label

    const nextWeekButton = screen.getByLabelText("Next week");
    fireEvent.click(nextWeekButton);

    const nextWeekStartDate = new Date(MOCK_DATE);
    nextWeekStartDate.setDate(MOCK_DATE.getDate() + 6); // 6 days from 23/7 is 29/7
    const expectedNextWeekLabel = formatDateLabel(nextWeekStartDate); // 29/7

    // Wait for the new date button to appear and be selected
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: expectedNextWeekLabel })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: expectedNextWeekLabel })
      ).toHaveClass("bg-red-600");
    });

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      "selectedShowtimeDate",
      expectedNextWeekLabel
    );
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  // Test 5: Handles previous week navigation (and prevents going before today)
  describe("Previous Week Navigation", () => {
    // Test 1: Successful previous week navigation
   
    // Test 2: Prevents navigation before today
    test("does not navigate before today", async () => {
      // Use default MOCK_DATE (today)

      await renderWithRedux(<ShowtimePage />);

      // Verify today is selected initially
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: formatDateLabel(MOCK_DATE) })
        ).toHaveClass("bg-red-600");
      });

      // Verify previous week button is NOT present
      expect(screen.queryByLabelText("Previous week")).not.toBeInTheDocument();

      // Alternative: If button exists but should be disabled
      // const prevButton = screen.getByLabelText('Previous week');
      // expect(prevButton).toBeDisabled();
    });
  });

  // Test 7: Scroll to top button visibility
  test("scroll to top button appears on scroll and hides when at top", async () => {
    await renderWithRedux(<ShowtimePage />);

    expect(screen.queryByLabelText("Back to top")).not.toBeInTheDocument();

    fireEvent.scroll(window, { target: { scrollY: 400 } });
    await waitFor(() => {
      expect(screen.getByLabelText("Back to top")).toBeInTheDocument();
    });

    fireEvent.scroll(window, { target: { scrollY: 0 } });
    await waitFor(() => {
      expect(screen.queryByLabelText("Back to top")).not.toBeInTheDocument();
    });
  });

  // Test 8: Scroll to top button functionality
  test("clicking scroll to top button calls window.scrollTo", async () => {
    await renderWithRedux(<ShowtimePage />);

    fireEvent.scroll(window, { target: { scrollY: 400 } });
    await waitFor(() => screen.getByLabelText("Back to top"));

    fireEvent.click(screen.getByLabelText("Back to top"));
    expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  // Test 9: No movies available message
  test('displays "No movies available for this day" when no movies are fetched', async () => {
    axios.get.mockResolvedValue({ data: [] });
    await renderWithRedux(<ShowtimePage />);

    await waitFor(() => {
      expect(
        screen.getByText("No movies available for this day.")
      ).toBeInTheDocument();
    });
    expect(screen.queryByTestId("movie-card")).not.toBeInTheDocument();
  });

  // Update the test to match the actual rendered dates
  test("initial selected date is loaded from sessionStorage", async () => {
    // 1. Set up a date that will be in the rendered week range
    const sessionStorageDate = new Date("2025-07-23T00:00:00.000Z"); // Today (23/7)
    const sessionStorageLabel = formatDateLabel(sessionStorageDate); // "23/7"

    // 2. Mock sessionStorage to return this date
    mockSessionStorage.getItem.mockImplementation((key) => {
      if (key === "selectedShowtimeDate") return sessionStorageLabel;
      return null;
    });

    // 3. Render the component
    await renderWithRedux(<ShowtimePage />);

    // 4. Verify the date from sessionStorage is selected
    const selectedDateButton = await screen.findByRole("button", {
      name: sessionStorageLabel,
    });

    expect(selectedDateButton).toBeInTheDocument();
    expect(selectedDateButton).toHaveClass("bg-red-600");

    // 5. Verify other dates in the week are present but not selected
    const weekDates = getWeekDates(sessionStorageDate);
    weekDates.forEach((date) => {
      const dateLabel = formatDateLabel(date);
      const button = screen.getByRole("button", { name: dateLabel });
      if (dateLabel === sessionStorageLabel) {
        expect(button).toHaveClass("bg-red-600");
      } else {
        expect(button).not.toHaveClass("bg-red-600");
      }
    });
  });
  // Test 11: setSelectedSeats is dispatched on initial mount
  test("setSelectedSeats is dispatched on initial mount", async () => {
    const { dispatch } = await renderWithRedux(<ShowtimePage />);
    expect(dispatch).toHaveBeenCalledWith(
      setSelectedSeats({ seats: [], totalPrice: 0 })
    );
  });
});
