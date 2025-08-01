import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewMembers from '../ViewMembersList';

jest.mock('antd', () => ({
  message: {
    success: jest.fn()
  },
  Modal: {
    confirm: jest.fn(({ onOk }) => {
      if (onOk) onOk();
    })
  },
  Switch: ({ checked, onChange }) => (
    <button 
      data-testid={`switch-${checked ? 'active' : 'inactive'}`}
      onClick={() => onChange(!checked)}
    >
      {checked ? 'Active' : 'Inactive'}
    </button>
  )
}));

jest.mock('@ant-design/icons', () => ({
  ExclamationCircleFilled: () => <span>Warning Icon</span>
}));

jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => (
  <div data-testid="sidebar-layout">{children}</div>
));

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('ViewMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders the member management page with member list', () => {
    render(
      <MemoryRouter>
        <ViewMembers />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('sidebar-layout')).toBeInTheDocument();
    expect(screen.getByText('Member Management')).toBeInTheDocument();
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    
    expect(screen.getByText('ID #')).toBeInTheDocument();
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    expect(screen.getByText('tantran@gmail.com')).toBeInTheDocument();
  });

  test('search functionality filters members correctly', () => {
    render(
      <MemoryRouter>
        <ViewMembers />
      </MemoryRouter>
    );
    
    const searchInput = screen.getByPlaceholderText('Search...');
    
    fireEvent.change(searchInput, { target: { value: 'Hoa' } });
    expect(screen.getByText('Nguyen Thi Hoa')).toBeInTheDocument();
    expect(screen.queryByText('Tran Van Tan')).not.toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'tantran' } });
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    expect(screen.queryByText('Nguyen Thi Hoa')).not.toBeInTheDocument();
  });

  test('pagination works correctly', () => {
    render(
      <MemoryRouter>
        <ViewMembers />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Next'));
    
    expect(screen.getByText('Nguyen Trung Hieu')).toBeInTheDocument();
    expect(screen.queryByText('Tran Van Tan')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Previous'));
    expect(screen.getByText('Tran Van Tan')).toBeInTheDocument();
    expect(screen.queryByText('Nguyen Trung Hieu')).not.toBeInTheDocument();
  });
});