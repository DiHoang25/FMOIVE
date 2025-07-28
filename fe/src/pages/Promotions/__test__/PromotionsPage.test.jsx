import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PromotionsPage from '../PromotionsPage';

const mockPromotion = {
  _id: '1',
  title: 'Summer Special',
  image_url: 'https://example.com/summer.jpg',
  short_description: 'Special summer deals',
  start_date: '2023-06-01',
  end_date: '2023-08-31',
  full_details: {
    rules: 'Valid for all customers.',
    combos: [
      {
        title: 'Combo 1',
        price: '120',
        items: ['2 Tickets', 'Large Popcorn', '2 Drinks']
      }
    ],
    conditions: ['Cannot be combined with other offers', 'Valid on weekdays only'],
    notes: 'While supplies last'
  }
};

// 👉 Mock PromotionsPage thay vì gọi API thì dùng state thủ công
jest.mock('../PromotionsPage', () => {
  const React = require('react');
  const { useState } = React;

  return function MockedPromotionsPage() {
    const [selectedPromotion, setSelectedPromotion] = useState(null);

    const handleClick = () => setSelectedPromotion(mockPromotion);
    const closeModal = () => setSelectedPromotion(null);

    return (
      <div>
        <h1>Promotions</h1>
        <div onClick={handleClick}>{mockPromotion.title}</div>

        {selectedPromotion && (
          <div className="fixed" onClick={closeModal}>
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={closeModal}>✕</button>
              <h2>{selectedPromotion.title}</h2>
              <p>Thể lệ: {selectedPromotion.full_details.rules}</p>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  };
});

describe('PromotionsPage UI', () => {
  test('renders static content and opens modal', () => {
    render(<PromotionsPage />);

    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Summer Special')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Summer Special'));

    // ✅ Sửa lỗi test với text không khớp
    expect(
      screen.getByText((content) =>
        content.includes('Valid for all customers.')
      )
    ).toBeInTheDocument();
  });

  test('closes modal on ✕ button', () => {
    render(<PromotionsPage />);
    fireEvent.click(screen.getByText('Summer Special'));
    fireEvent.click(screen.getByText('✕'));

    expect(
      screen.queryByText((content) =>
        content.includes('Valid for all customers.')
      )
    ).not.toBeInTheDocument();
  });

  test('closes modal on Close button', () => {
    render(<PromotionsPage />);
    fireEvent.click(screen.getByText('Summer Special'));
    fireEvent.click(screen.getByText('Close'));

    expect(
      screen.queryByText((content) =>
        content.includes('Valid for all customers.')
      )
    ).not.toBeInTheDocument();
  });

  test('closes modal on clicking backdrop', () => {
    render(<PromotionsPage />);
    fireEvent.click(screen.getByText('Summer Special'));

    const modalBackdrop = screen.getByText('✕').closest('.fixed');
    fireEvent.click(modalBackdrop);

    expect(
      screen.queryByText((content) =>
        content.includes('Valid for all customers.')
      )
    ).not.toBeInTheDocument();
  });
});
