// src/pages/Admin/__test__/AddMovie.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { message } from 'antd';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import AddMovie from '../AddMovie';
import axios from 'axios';

// Mock all required components
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock Ant Design components
jest.mock('antd', () => ({
  Modal: ({ open, onCancel, footer, children }) => (
    open ? <div data-testid="success-modal">{children}</div> : null
  ),
  message: {
    error: jest.fn(),
    loading: jest.fn(() => jest.fn()),
    success: jest.fn()
  }
}));

// Mock custom components
jest.mock('../../../components/DatePicker', () => ({ value, onChange, ...props }) => (
  <input 
    type="date"
    data-testid="date-picker"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    {...props}
  />
));

jest.mock('../../../components/DropDown', () => ({ value, onChange, options, ...props }) => (
  <select 
    data-testid="dropdown"
    value={value?.value || ''}
    onChange={(e) => onChange({ value: e.target.value })}
    {...props}
  >
    <option value="">Select an option</option>
    {options?.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </select>
));

jest.mock('../../../components/TimePicker', () => ({ value, onChange, ...props }) => (
  <input 
    type="time"
    data-testid="time-picker"
    value={value || ''}
    onChange={(e) => onChange([e.target.value])}
    {...props}
  />
));

jest.mock('../../../components/GernesPicker', () => ({ value, onChange, ...props }) => (
  <input 
    data-testid="genres-dropdown"
    value={value || ''}
    onChange={(e) => onChange(e.target.value.split(','))}
    {...props}
  />
));

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

// Mock axios
jest.mock('axios');

// Mock useNavigate
const mockNavigate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // Mock URL.createObjectURL
  global.URL.createObjectURL = jest.fn(() => 'mocked-url');

  // Mock fetch for rooms
  jest.spyOn(global, 'fetch').mockResolvedValue({
    json: async () => ({
      rooms: [
        { roomId: 1, roomName: 'Room A', roomType: '2D', is_actived: true },
        { roomId: 2, roomName: 'Room B', roomType: '3D', is_actived: true },
        { roomId: 3, roomName: 'Room C', roomType: 'IMAX', is_actived: true },
      ]
    }),
  });

  useNavigate.mockReturnValue(mockNavigate);
});


afterEach(() => {
  jest.restoreAllMocks();
});

describe('AddMovie Page', () => {
  const renderPage = () => {
    return render(
      <MemoryRouter>
        <AddMovie />
      </MemoryRouter>
    );
  };

  it('renders the heading', () => {
    renderPage();
    expect(screen.getByText('Add New Movie')).toBeInTheDocument();
  });

  it('renders all required input fields', () => {
    renderPage();
    
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument(); // Movie Name
    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[1]).toBeInTheDocument(); // Actor(s)
    expect(screen.getAllByRole('textbox')[2]).toBeInTheDocument(); // Production Company
    expect(screen.getAllByRole('textbox')[3]).toBeInTheDocument(); // Director
    expect(screen.getAllByRole('textbox')[4]).toBeInTheDocument(); // Running Time
    expect(screen.getAllByRole('textbox')[5]).toBeInTheDocument(); // Trailer Link
    expect(screen.getByText('Genres')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Cinema Rooms')).toBeInTheDocument();
    expect(screen.getByText('Show Times')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')[6]).toBeInTheDocument(); // Movie Description
  });

  it('renders Submit and Cancel buttons', () => {
    renderPage();
    expect(screen.getByRole('button', { name: /Submit Movie/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('renders version buttons (2D, 3D, IMAX)', () => {
    renderPage();
    expect(screen.getByRole('button', { name: '2D' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '3D' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'IMAX' })).toBeInTheDocument();
  });

  it('renders file upload sections', () => {
    renderPage();
    expect(screen.getByText('Movie Poster')).toBeInTheDocument();
    expect(screen.getByText('Banner Image')).toBeInTheDocument();
  });

  it('does not submit form with empty required fields', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Submit Movie/i }));

    await waitFor(() => {
      expect(message.error).toHaveBeenCalled();
    });
  });

  it('submits form successfully with all required fields', async () => {
    axios.post.mockResolvedValue({ data: { success: true } });
    
    renderPage();

    const textboxes = screen.getAllByRole('textbox');

    // Fill required fields
    // Fill required fields to bypass validation and reach axios.post
    fireEvent.change(textboxes[0], { target: { value: 'Test Movie' } }); // Movie Name
    fireEvent.change(screen.getAllByTestId('date-picker')[0], { target: { value: '2024-01-01' } }); // From Date
    fireEvent.change(screen.getAllByTestId('date-picker')[1], { target: { value: '2024-01-31' } }); // To Date
    fireEvent.change(textboxes[1], { target: { value: 'Test Actor' } }); // Actor(s)
    fireEvent.change(textboxes[2], { target: { value: 'Test Company' } }); // Production Company
    fireEvent.change(textboxes[3], { target: { value: 'Test Director' } }); // Director
    fireEvent.change(textboxes[4], { target: { value: '120' } }); // Running Time
    fireEvent.change(textboxes[5], { target: { value: 'https://youtube.com/test' } }); // Trailer Link
    fireEvent.change(screen.getByTestId('genres-dropdown'), { target: { value: 'Action,Comedy' } });
    fireEvent.change(screen.getByTestId('dropdown'), { target: { value: '1' } });
    fireEvent.change(screen.getByTestId('time-picker'), { target: { value: '10:00' } });
    fireEvent.change(textboxes[6], { target: { value: 'Test description' } }); // Movie Description





    // Mock file inputs
    const posterFile = new File(['poster'], 'poster.jpg', { type: 'image/jpeg' });
    const bannerFile = new File(['banner'], 'banner.jpg', { type: 'image/jpeg' });
    const posterInput = screen.getByTestId('movie-poster-input');
    const bannerInput = screen.getByTestId('banner-image-input');
    fireEvent.change(posterInput, { target: { files: [posterFile] } });
    fireEvent.change(bannerInput, { target: { files: [bannerFile] } });

    // Select version
    fireEvent.click(screen.getByRole('button', { name: '2D' }));
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Submit Movie/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/movies', expect.any(FormData));
    });
  });

  it('handles API error during submission', async () => {
    axios.post.mockRejectedValueOnce({
      response: { data: { message: 'Error adding movie' } }
    });
    
    renderPage();
    
    // Fill required fields
    const textboxes = screen.getAllByRole('textbox');
    fireEvent.change(textboxes[0], { target: { value: 'Test Movie' } });

    // Mock file inputs
    const posterFile = new File(['poster'], 'poster.jpg', { type: 'image/jpeg' });
    const bannerFile = new File(['banner'], 'banner.jpg', { type: 'image/jpeg' });
    const posterInput = screen.getByTestId('movie-poster-input');
    const bannerInput = screen.getByTestId('banner-image-input');
    fireEvent.change(posterInput, { target: { files: [posterFile] } });
    fireEvent.change(bannerInput, { target: { files: [bannerFile] } });
    
    const submitButton = screen.getByText('Submit Movie');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
      expect(message.error).toHaveBeenCalledWith('Error adding movie');
    });
  });

  it('navigates to movie list when Cancel button is clicked', () => {
    renderPage();
    
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });
});