import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import CounterSelectionSeat from "../CounterSelectionSeat";

jest.mock("../../../components/Sidebar-Employee", () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

jest.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Test Staff", role: "employee" },
    logout: jest.fn(),
  }),
}));

const mockStore = configureStore([]);
const store = mockStore({
  booking: {
    user: { name: "Test Staff" },
    selectedMovie: { name: "Test Movie", duration: 120 },
    selectedShowtime: { date: "2025-07-29", time: "18:00", room: "Room 1" },
    selectedSeats: ["A1", "A2"],
    selectedCombos: [],
    totalPrice: 200000,
  },
});

describe("CounterSelectionSeat Page", () => {
  const renderPage = () =>
    render(
      <Provider store={store}>
        <MemoryRouter>
          <CounterSelectionSeat />
        </MemoryRouter>
      </Provider>
    );

  it("hiển thị tiêu đề chọn ghế", () => {
    renderPage();

    expect(screen.getByText(/SELECT YOUR SEATS/i)).toBeInTheDocument();
  });

  it("hiển thị nút CONTINUE", () => {
    renderPage();

    const button = screen.getByRole("button", { name: /CONTINUE/i });
    expect(button).toBeInTheDocument();
  });

  it("có sidebar được mock", () => {
    renderPage();

    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
  });
});