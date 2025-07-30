// src/pages/Employee/__test__/EditCombo.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useParams, useNavigate } from 'react-router-dom';
import { Select, InputNumber, message, Form } from 'antd';
import EditCombo from '../EditCombo';

// Mock dayjs
jest.mock('dayjs', () => {
  const originalDayjs = jest.requireActual('dayjs');
  const mockDayjs = (date) => {
    if (date) return originalDayjs(date);
    return originalDayjs('2023-01-01');
  };
  mockDayjs.extend = jest.fn();
  return mockDayjs;
});

// Mock router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

// Mock Form
const mockForm = {
  getFieldsValue: jest.fn().mockReturnValue({}),
  setFieldsValue: jest.fn(),
  validateFields: jest.fn().mockResolvedValue({}),
  getFieldInstance: jest.fn(),
  getFieldError: jest.fn(),
  getFieldsError: jest.fn(),
  getFieldValue: jest.fn(),
  isFieldsTouched: jest.fn(),
  isFieldTouched: jest.fn(),
  isFieldValidating: jest.fn(),
  resetFields: jest.fn(),
  scrollToField: jest.fn(),
  setFields: jest.fn(),
  submit: jest.fn(),
};

jest.mock('antd', () => ({
  ...jest.requireActual('antd'),
  Select: jest.fn(),
  InputNumber: jest.fn(),
  message: {
    loading: jest.fn(() => ({ hide: jest.fn() })),
    success: jest.fn(),
    error: jest.fn(),
  },
  Form: {
    ...jest.requireActual('antd').Form,
    useForm: jest.fn(() => [mockForm]),
  },
}));

jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div>{children}</div>);

jest.mock('../../../components/DatePicker', () => {
  const dayjs = require('dayjs');
  return ({ name, value, onChange }) => (
    <input
      type="date"
      data-testid={`datepicker-${name}`}
      value={value?.format('YYYY-MM-DD') || ''}
      onChange={(e) => onChange(dayjs(e.target.value))}
    />
  );
});

describe('EditCombo Component', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useParams.mockReturnValue({ id: '123' });
    useNavigate.mockReturnValue(mockNavigate);

    Object.values(message).forEach(fn => {
      if (typeof fn === 'function') fn.mockClear();
    });

    Object.keys(mockForm).forEach(key => {
      if (typeof mockForm[key] === 'function') {
        mockForm[key].mockClear();
      }
    });

    Select.mockImplementation(({ children, onChange, value }) => (
      <select
        data-testid="mock-select"
        multiple
        onChange={(e) =>
          onChange(Array.from(e.target.selectedOptions, (opt) => opt.value))
        }
        value={value}
      >
        {children}
      </select>
    ));

    InputNumber.mockImplementation(({ onChange, value }) => (
      <input
        type="number"
        data-testid="mock-input-number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    ));

    Form.useForm.mockReturnValue([mockForm]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<EditCombo />);
    expect(screen.getByText('Edit Combo')).toBeInTheDocument();
  });

  it('should handle text input changes', () => {
    render(<EditCombo />);
    const inputs = screen.getAllByRole('textbox');

    fireEvent.change(inputs[0], { target: { value: 'Test Combo' } });
    expect(inputs[0].value).toBe('Test Combo');

    fireEvent.change(inputs[1], { target: { value: 'Test Description' } });
    expect(inputs[1].value).toBe('Test Description');
  });

  it('should handle number input changes', () => {
    render(<EditCombo />);
    const priceInput = screen.getByTestId('mock-input-number');
    fireEvent.change(priceInput, { target: { value: '100000' } });
    expect(priceInput.value).toBe('100000');
  });

  it('should handle date picker changes', () => {
    render(<EditCombo />);

    const fromDateInput = screen.getByTestId('datepicker-fromDate');
    fireEvent.change(fromDateInput, { target: { value: '2023-01-02' } });
    expect(fromDateInput.value).toBe('2023-01-02');

    const toDateInput = screen.getByTestId('datepicker-toDate');
    fireEvent.change(toDateInput, { target: { value: '2023-01-03' } });
    expect(toDateInput.value).toBe('2023-01-03');
  });

  it('should handle cancel button click', () => {
    render(<EditCombo />);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockNavigate).toHaveBeenCalledWith('/employee/view-combo');
  });
});