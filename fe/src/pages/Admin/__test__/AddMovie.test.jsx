// src/pages/Admin/__test__/AddMovie.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddMovie from '../AddMovie';

// Mock SidebarAdmin để bỏ qua layout
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

beforeEach(() => {
    // Mock global fetch trả về danh sách phòng
    jest.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({
        rooms: [
          { id: 1, name: 'Room A', is_actived: true },
          { id: 2, name: 'Room B', is_actived: false }, // bị filter
          { id: 3, name: 'Room C', is_actived: true },
        ]
      }),
    });
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
    expect(screen.getByText('Add new movie')).toBeInTheDocument();
  });

//   it('renders required input fields', () => {
//     renderPage();
  
//     expect(screen.getByRole('textbox', { name: /movie name/i })).toBeInTheDocument();
//     expect(screen.getByRole('textbox', { name: /trailer link/i })).toBeInTheDocument();
//     expect(screen.getByRole('textbox', { name: /actor/i })).toBeInTheDocument();
//     expect(screen.getByRole('textbox', { name: /product company/i })).toBeInTheDocument();
//     expect(screen.getByRole('textbox', { name: /director/i })).toBeInTheDocument();
//     expect(screen.getByRole('textbox', { name: /running time/i })).toBeInTheDocument();
//     expect(screen.getByRole('textbox', { name: /movie description/i })).toBeInTheDocument();
//   });
  

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

  it('does not submit form with empty required fields', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /Submit Movie/i }));

    // Sử dụng waitFor để chờ render thông báo lỗi
    await waitFor(() => {
      expect(screen.getByText((text) =>
        text.includes('Vui lòng nhập tên phim')
      )).toBeInTheDocument();
    });
  });
});
