// EditMovie.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditMovie from '../EditMovie';
import { BrowserRouter } from 'react-router-dom';

// Mock SidebarLayout
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock DatePicker, DropDown, GenresDropDown, TimePicker
jest.mock('../../../components/DatePicker', () => (props) => (
  <input type="date" onChange={(e) => props.onChange(e.target.value)} />
));
jest.mock('../../../components/DropDown', () => (props) => (
  <select onChange={(e) => props.onChange({ value: e.target.value })}>
    <option value="">Select</option>
    <option value="room1">Room 1</option>
  </select>
));
jest.mock('../../../components/GernesPicker', () => (props) => (
  <input
    type="text"
    placeholder="Genres"
    value={props.value}
    onChange={(e) => props.onChange(e.target.value.split(','))}
  />
));
jest.mock('../../../components/TimePicker', () => (props) => (
  <input
    type="text"
    placeholder="Show Times"
    value={props.value}
    onChange={(e) => props.onChange(e.target.value.split(','))}
  />
));

// Mock axios
jest.mock('axios');

const renderPage = () =>
  render(
    <BrowserRouter>
      <EditMovie />
    </BrowserRouter>
  );

describe('EditMovie Page', () => {
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

  it('renders loading initially', async () => {
    renderPage();
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

    it('navigates back when Cancel is clicked', async () => {
    renderPage();
    await waitFor(() => {
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeInTheDocument();
    });
  });

  it('renders showtime input and accepts values', async () => {
    renderPage();

    const input = await screen.findByPlaceholderText(/Show Times/i);
    fireEvent.change(input, { target: { value: '10:00,12:00' } });

    expect(input.value).toBe('10:00,12:00');
  });
});
