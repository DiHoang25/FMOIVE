// Mock window.matchMedia cho Ant Design
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
  import CinemaRooms from '../CinemaRooms';
  import { BrowserRouter } from 'react-router-dom';
  
  // Mock useNavigate
  jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
  }));
  
  // Mock SidebarLayout
  jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
    <div data-testid="mock-sidebar">{children}</div>
  ));
  
  beforeEach(() => {
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.endsWith('/api/theater/rooms')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              rooms: [
                {
                  roomId: 'room-1',
                  roomName: 'Room One',
                  roomType: '2D',
                  quantity: 50,
                  is_actived: true,
                  isDeleted: false,
                },
                {
                  roomId: 'room-2',
                  roomName: 'Room Two',
                  roomType: '3D',
                  quantity: 40,
                  is_actived: false,
                  isDeleted: false,
                },
              ],
            }),
        });
      }
  
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
  });
  
  describe('CinemaRooms Page', () => {
    it('renders loading initially and then loads data', async () => {
      render(
        <BrowserRouter>
          <CinemaRooms />
        </BrowserRouter>
      );
  
      expect(screen.getByText(/Loading data/i)).toBeInTheDocument();
  
      await waitFor(() => {
        expect(screen.getByText(/Cinema Room Management/i)).toBeInTheDocument();
        expect(screen.getByText(/Room One/i)).toBeInTheDocument();
        expect(screen.getByText(/Room Two/i)).toBeInTheDocument();
      });
    });
  
    it('filters rooms by search term', async () => {
      render(
        <BrowserRouter>
          <CinemaRooms />
        </BrowserRouter>
      );
  
      await screen.findByText(/Room One/i);
  
      const searchInput = screen.getByPlaceholderText(/search cinema room/i);
      fireEvent.change(searchInput, { target: { value: 'room-1' } });
  
      expect(screen.getByText(/Room One/i)).toBeInTheDocument();
      expect(screen.queryByText(/Room Two/i)).not.toBeInTheDocument();
    });
  
    it('shows "No cinema rooms found" if no match', async () => {
      render(
        <BrowserRouter>
          <CinemaRooms />
        </BrowserRouter>
      );
  
      await screen.findByText(/Room One/i);
  
      fireEvent.change(screen.getByPlaceholderText(/search cinema room/i), {
        target: { value: 'non-existent' },
      });
  
      expect(
        screen.getByText(/No cinema rooms found/i)
      ).toBeInTheDocument();
    });
  
    it('shows error if fetch fails', async () => {
      global.fetch.mockImplementationOnce(() =>
        Promise.resolve({ ok: false })
      );
  
      render(
        <BrowserRouter>
          <CinemaRooms />
        </BrowserRouter>
      );
  
      await waitFor(() => {
        expect(screen.getByText(/Failed to load cinema room list/i)).toBeInTheDocument();
      });
    });
  
    it('shows Add New Cinema Room link', async () => {
      render(
        <BrowserRouter>
          <CinemaRooms />
        </BrowserRouter>
      );
  
      const addLink = await screen.findByRole('link', { name: /\+ Add New Cinema Room/i });
      expect(addLink).toHaveAttribute('href', '/admin/cinema-rooms/add-new-cinema-room');
    });
  });
  