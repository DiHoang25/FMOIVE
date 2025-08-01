import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ViewCombo from '../ViewCombo';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('../../../components/Sidebar-Employee', () => ({ children }) => <div>{children}</div>);

jest.mock('axios');

describe('ViewCombo Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({
      data: {
        combos: [
          {
            _id: 'combo1',
            comboName: 'Combo Snack',
            price: 50000,
            description: 'Includes popcorn and drink',
            isActive: true,
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            image_url: '/combo.jpg',
            items: [
              { productName: 'Popcorn', quantity: 1 },
              { productName: 'Coke', quantity: 1 },
            ],
          },
        ],
      },
    });
  });

  it('renders ViewCombo and displays combo name', async () => {
    render(
      <MemoryRouter>
        <ViewCombo />
      </MemoryRouter>
    );

    expect(await screen.findByText(/Combo Management/i)).toBeInTheDocument();
    expect(await screen.findByText(/Combo Snack/i)).toBeInTheDocument();
  });

  it('shows combo items in modal when clicked', async () => {
    render(
      <MemoryRouter>
        <ViewCombo />
      </MemoryRouter>
    );

    const viewButtons = await screen.findAllByRole('button');
    fireEvent.click(viewButtons[0]);

    expect(await screen.findByText(/Popcorn \(x1\)/i)).toBeInTheDocument();
    expect(await screen.findByText(/Coke \(x1\)/i)).toBeInTheDocument();
  });

  it('shows message when no combos are available', async () => {
    axios.get.mockResolvedValueOnce({ data: { combos: [] } });

    render(
      <MemoryRouter>
        <ViewCombo />
      </MemoryRouter>
    );

    expect(await screen.findByText(/No combos found/i)).toBeInTheDocument();
  });

  it('shows loading spinner initially', () => {
    render(
      <MemoryRouter>
        <ViewCombo />
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading combos/i)).toBeInTheDocument();
  });

  it('renders combo image in modal correctly', async () => {
    render(
      <MemoryRouter>
        <ViewCombo />
      </MemoryRouter>
    );

    const viewButtons = await screen.findAllByRole('button');
    fireEvent.click(viewButtons[0]);

    const image = await screen.findByAltText('Combo');
    expect(image).toHaveAttribute('src', '/combo.jpg');
  });
});
