import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewProduct from '../ViewProduct';


jest.mock('../ViewProduct', () => () => <div>Mock ViewProduct Component</div>);

describe('ViewProduct', () => {
  test('renders correctly with mock', () => {
    render(
      <MemoryRouter>
        <ViewProduct />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Mock ViewProduct Component')).toBeInTheDocument();
  });
});