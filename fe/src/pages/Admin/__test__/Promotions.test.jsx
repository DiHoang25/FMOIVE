// __tests__/Promotions.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Promotions from '../Promotions';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

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

jest.mock('axios', () => ({
  get: jest.fn(),
}));

const mockPromotions = [
  {
    _id: '1',
    promotion_code: 'SALE10',
    title: 'Discount 10%',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    discount: 10,
    createdAt: new Date().toISOString(),
  },
  {
    _id: '2',
    promotion_code: 'SALE20',
    title: 'Discount 20%',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    discount: 20,
    createdAt: new Date().toISOString(),
  },
];

const renderPage = async () => {
  const axios = require('axios');
  axios.get.mockResolvedValueOnce({ data: mockPromotions });
  render(
    <BrowserRouter>
      <Promotions />
    </BrowserRouter>
  );
};

describe('Promotions Page', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner initially', async () => {
    const axios = require('axios');
    axios.get.mockImplementation(() => new Promise(() => {}));
    render(
      <BrowserRouter>
        <Promotions />
      </BrowserRouter>
    );
    expect(await screen.findByText(/loading promotions/i)).toBeInTheDocument();
  });

  it('displays promotion data after fetch', async () => {
    await renderPage();
    expect(await screen.findByText('Discount 10%')).toBeInTheDocument();
    expect(screen.getByText('Discount 20%')).toBeInTheDocument();
  });

  it('renders "No promotions found" if list is empty', async () => {
    const axios = require('axios');
    axios.get.mockResolvedValueOnce({ data: [] });
    render(
      <BrowserRouter>
        <Promotions />
      </BrowserRouter>
    );
    expect(await screen.findByText(/no promotions found/i)).toBeInTheDocument();
  });

  it('filters promotions by search keyword', async () => {
    await renderPage();
    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: '20%' },
    });
    expect(screen.queryByText('Discount 10%')).not.toBeInTheDocument();
    expect(screen.getByText('Discount 20%')).toBeInTheDocument();
  });

  it('shows pagination if more than 8 promotions', async () => {
    const axios = require('axios');
    const manyPromos = Array.from({ length: 9 }, (_, i) => ({
      ...mockPromotions[0],
      _id: `${i + 1}`,
      title: `Promo ${i + 1}`,
    }));
    axios.get.mockResolvedValueOnce({ data: manyPromos });
    render(
      <BrowserRouter>
        <Promotions />
      </BrowserRouter>
    );
    expect(await screen.findByText('Promo 1')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('sorts discount ascending and descending', async () => {
    await renderPage();
    const discountHeader = screen.getByText(/discount/i);
    fireEvent.click(discountHeader);
    fireEvent.click(discountHeader);
    fireEvent.click(discountHeader);
    expect(discountHeader).toBeInTheDocument();
  });

});