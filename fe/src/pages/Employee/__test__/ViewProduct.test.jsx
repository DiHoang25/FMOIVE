import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewProduct from '../ViewProduct';
import * as ReactRouterDom from 'react-router-dom';



jest.mock('../../../components/PaginationHomepage', () => () => <div data-testid="pagination">Pagination</div>);
jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div>{children}</div>);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));


jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: { products: [] } })),
}));

describe('ViewProduct Component', () => {
  test('renders title and search input', () => {
    render(<ViewProduct />);
    expect(screen.getByText(/Product Management/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search product/i)).toBeInTheDocument();
  });



  test('search input updates value', () => {
    render(<ViewProduct />);
    const input = screen.getByPlaceholderText(/Search product/i);
    fireEvent.change(input, { target: { value: 'Laptop' } });
    expect(input.value).toBe('Laptop');
  });

  test('renders pagination when products exist', async () => {
    const mockProducts = [
      { _id: '1', productName: 'Test Product', price: 1000000, category: 'Electronics', stockQuantity: 10, is_deleted: false },
    ];
    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

    render(<ViewProduct />);
    expect(await screen.findByTestId('pagination')).toBeInTheDocument();
  });
});
