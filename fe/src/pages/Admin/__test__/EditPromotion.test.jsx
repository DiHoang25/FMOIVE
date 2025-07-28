import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditPromotion from '../EditPromotion';
import { BrowserRouter } from 'react-router-dom';

// Mock Sidebar
jest.mock('../../../components/Sidebar-Admin', () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock useParams, useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'mock-id' }),
  useNavigate: () => jest.fn(),
}));

// Do NOT mock dayjs to keep DatePicker functionality working properly

// Mock fetch
beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (url.includes('/api/promotions/') && !options) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          title: 'Promo Title',
          promotion_code: 'CODE123',
          short_description: 'Short desc',
          discount: 15,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          full_details: {
            rules: 'Some rules',
            notes: 'Some notes',
            combos: [{ title: 'Combo 1', price: 100, items: ['A', 'B'] }],
            conditions: ['Condition A']
          },
          image_url: 'http://promo.jpg'
        }),
      });
    }
    if (options?.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });
    }
    return Promise.reject('Unhandled fetch call');
  });
});

const renderPage = () =>
  render(
    <BrowserRouter>
      <EditPromotion />
    </BrowserRouter>
  );

  describe('EditPromotion Page', () => {
   
  
    it('displays read-only title with Edit button', async () => {
      renderPage();
      const title = await screen.findByText('Promo Title');
      expect(title).toBeInTheDocument();
      expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
    });
  
    it('toggles title input when Edit clicked', async () => {
      renderPage();
      const editBtn = (await screen.findAllByText('Edit'))[0];
      fireEvent.click(editBtn);
      expect(await screen.findByRole('textbox')).toBeInTheDocument();
    });
  
  
    it('renders and toggles condition fields', async () => {
      renderPage();
      const cond = await screen.findByText('Condition A');
      expect(cond).toBeInTheDocument();
      fireEvent.click(screen.getAllByText('Edit').find((el) =>
        el.closest('div')?.textContent.includes('Condition')
      ));
      await waitFor(() =>
        expect(screen.getByDisplayValue('Condition A')).toBeInTheDocument()
      );
    });
  
    it('renders image preview and allows upload toggle', async () => {
      renderPage();
      const image = await screen.findByAltText('Promotion');
      expect(image).toBeInTheDocument();
      fireEvent.click(screen.getAllByText('Edit').pop());
      expect(await screen.findByText(/Click to Upload/i)).toBeInTheDocument();
    });
  
    it('renders Cancel and Update buttons', async () => {
      renderPage();
      const cancel = await screen.findByRole('button', { name: /Cancel/i });
      const submit = await screen.findByRole('button', { name: /Update Promotion/i });
      expect(cancel).toBeInTheDocument();
      expect(submit).toBeInTheDocument();
    });
  
  
    it('submits form and calls PUT request', async () => {
      renderPage();
      const submit = await screen.findByRole('button', { name: /Update Promotion/i });
      fireEvent.click(submit);
  
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/promotions/'),
          expect.objectContaining({ method: 'PUT' })
        );
      });
    });
  
  });
  