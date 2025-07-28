// src/pages/Admin/__test__/AddPromotion.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddPromotion from '../AddPromotion';
import { BrowserRouter } from 'react-router-dom';

// Mock matchMedia cho antd
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

// Mock SidebarAdmin để không ảnh hưởng layout
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

const renderPage = () =>
  render(
    <BrowserRouter>
      <AddPromotion />
    </BrowserRouter>
  );

describe('AddPromotion Page', () => {
  it('renders basic form fields', () => {
    renderPage();

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Promotion Code/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Short Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Discount/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /Add Promotion/i }));

    await waitFor(() => {
      const errors = screen.getAllByText((text) => text.includes('required'));
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('can add and remove a combo item', async () => {
    renderPage();

    const addComboBtn = screen.getByRole('button', { name: /Add Combo/i });
    fireEvent.click(addComboBtn);

    expect(screen.getByText(/Combo 2/i)).toBeInTheDocument();

    const removeBtn = screen.getAllByRole('button', { name: /Remove Combo/i })[1];
    fireEvent.click(removeBtn);

    expect(screen.queryByText(/Combo 2/i)).not.toBeInTheDocument();
  });

  it('can add and remove condition inputs', async () => {
    renderPage();

    const addCondBtn = screen.getByRole('button', { name: /Add Condition/i });
    fireEvent.click(addCondBtn);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(1); // Đã thêm condition mới

    const deleteBtns = screen.getAllByRole('button', { name: 'X' });
    fireEvent.click(deleteBtns[0]);

    // Không lỗi và vẫn render lại
    expect(screen.getByRole('button', { name: /Add Condition/i })).toBeInTheDocument();
  });

  it('renders Cancel button and is clickable', () => {
    renderPage();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    expect(cancelBtn).toBeInTheDocument();
    fireEvent.click(cancelBtn);
    // Không có navigation assertion, chỉ kiểm tra không lỗi
  });
});
