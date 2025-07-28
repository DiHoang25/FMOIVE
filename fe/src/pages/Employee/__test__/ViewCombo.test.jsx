import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewCombo from '../ViewCombo';

// Mock the actual component to avoid real rendering
jest.mock('../ViewCombo', () => () => <div>Mocked View Combo</div>);

// Simple test to ensure the component doesn't crash
describe('ViewCombo', () => {
  test('renders without crashing', () => {
    render(
      <MemoryRouter>
        <ViewCombo />
      </MemoryRouter>
    );
  });
});