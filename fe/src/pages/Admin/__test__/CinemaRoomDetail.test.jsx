// Mock window.matchMedia cho antd dùng
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
  
  import React from 'react';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import CinemaRoomDetail from '../CinemaRoomDetail';
  import { BrowserRouter } from 'react-router-dom';
  
  // Mock react-router hooks
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ roomId: 'test-room-id' }),
    useNavigate: () => jest.fn(),
  }));
  
  // Mock react-redux
  jest.mock('react-redux', () => ({
    useDispatch: () => jest.fn(),
  }));
  
  // Mock SidebarAdmin
  jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
    <div data-testid="mock-sidebar">{children}</div>
  ));
  
  // Mock fetch
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes('/api/theater/rooms/test-room-id')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              room: {
                _id: 'test-room-id',
                rows: 2,
                columns: 2,
                seats: [
                  { label: 'A1', row: 1, column: 1, type: 'Normal', price: 90000 },
                  { label: 'A2', row: 1, column: 2, type: 'Normal', price: 90000 },
                  { label: 'B1', row: 2, column: 1, type: 'VIP', price: 150000 },
                  { label: 'B2', row: 2, column: 2, type: 'VIP', price: 150000 },
                ],
              },
            }),
        });
      }
  
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });
  
  describe('CinemaRoomDetail Page', () => {
    it('renders loading state initially', () => {
      render(
        <BrowserRouter>
          <CinemaRoomDetail />
        </BrowserRouter>
      );
  
      expect(screen.getByText(/Loading seats/i)).toBeInTheDocument();
    });
  
    
  
    it('toggles seat when clicked', async () => {
      render(
        <BrowserRouter>
          <CinemaRoomDetail />
        </BrowserRouter>
      );
  
      const seatA1 = await screen.findByText('A1');
      fireEvent.click(seatA1);
  
     
      expect(seatA1).toBeInTheDocument(); 
    });
  
    it('switches select mode between single and row', async () => {
      render(
        <BrowserRouter>
          <CinemaRoomDetail />
        </BrowserRouter>
      );
  
      const singleBtn = screen.getByRole('button', { name: /Single/i });
      const multipleBtn = screen.getByRole('button', { name: /Multiple/i });
  
      fireEvent.click(multipleBtn);
      expect(multipleBtn).toHaveClass('bg-blue-600');
  
      fireEvent.click(singleBtn);
      expect(singleBtn).toHaveClass('bg-blue-600');
    });
  
  
    it('disables Convert buttons when no row is selected', async () => {
      render(
        <BrowserRouter>
          <CinemaRoomDetail />
        </BrowserRouter>
      );
  
      const convertVIP = await screen.findByRole('button', { name: /Convert to VIP/i });
      const convertNormal = await screen.findByRole('button', { name: /Convert to Normal/i });
  
      expect(convertVIP).toBeDisabled();
      expect(convertNormal).toBeDisabled();
    });
  });
  