import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddCombo from '../AddCombo';
import { MemoryRouter } from 'react-router-dom';
import { message } from 'antd';


jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div>{children}</div>);


jest.mock('../../../components/DatePicker', () => (props) => (
  <input
    type="date"
    data-testid={`datepicker-${props.name}`}
    onChange={(e) => props.onChange(e.target.value)}
  />
));


jest.mock('antd', () => {
  const original = jest.requireActual('antd');
  return {
    ...original,
    message: {
      ...original.message,
      error: jest.fn(),
      success: jest.fn(),
      loading: jest.fn(() => jest.fn()), 
    },
  };
});

describe('AddCombo Component', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <AddCombo />
      </MemoryRouter>
    );
  });

  it('renders heading and datepickers', () => {
    expect(screen.getByText(/Add New Combo/i)).toBeInTheDocument();
    expect(screen.getByTestId('datepicker-fromDate')).toBeInTheDocument();
    expect(screen.getByTestId('datepicker-toDate')).toBeInTheDocument();
  });

  it('allows typing into name and description fields', () => {
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'Combo A' } });
    fireEvent.change(inputs[1], { target: { value: 'Combo description' } });

    expect(inputs[0]).toHaveValue('Combo A');
    expect(inputs[1]).toHaveValue('Combo description');
  });

  it('clicking Cancel does not crash', () => {
    const cancelButton = screen.getByText(/Cancel/i);
    fireEvent.click(cancelButton);
    
  });

  it('submitting without image shows error', () => {
    const submitButton = screen.getByText(/Add Combo/i);
    fireEvent.click(submitButton);

    expect(message.error).toHaveBeenCalledWith('Vui lòng chọn ảnh cho combo.');
  });
});
