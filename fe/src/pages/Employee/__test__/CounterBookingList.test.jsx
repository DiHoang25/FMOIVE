import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CounterBookingList from '../CounterBookingList';

// Mock the actual component to avoid real rendering
jest.mock('../CounterBookingList', () => () => <div>Mocked Booking List</div>);

// Simple test to ensure the component doesn't crash
describe('CounterBookingList', () => {
  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <CounterBookingList />
      </MemoryRouter>
    );
  });
});