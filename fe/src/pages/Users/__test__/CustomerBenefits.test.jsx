import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CustomerBenefits from '../CustomerBenefits'; // Adjust path as needed

// Mock react-router-dom's Link component
// This ensures that Link components are rendered as simple anchors in tests
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...rest }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

describe('CustomerBenefits Component', () => {
  // Test Case 1: Renders the main heading
  test('1. Renders the main "Customer Benefits" heading', () => {
    render(<CustomerBenefits />);
    expect(screen.getByRole('heading', { name: /customer benefits/i, level: 1 })).toBeInTheDocument();
  });

  // Test Case 2: Renders the introductory paragraph
  test('2. Renders the introductory paragraph about MovieTheater commitment', () => {
    render(<CustomerBenefits />);
    expect(screen.getByText(/at movietheater, we are committed to providing our customers with the most enjoyable movie experiences/i)).toBeInTheDocument();
  });

  // Test Case 3: Renders the "Membership Benefits" section heading
  test('3. Renders the "Membership Benefits" section heading', () => {
    render(<CustomerBenefits />);
    expect(screen.getByRole('heading', { name: /membership benefits:/i, level: 2 })).toBeInTheDocument();
  });

  // Test Case 4: Renders a specific membership benefit (updated to handle text split by <strong>)
  test('4. Renders "Priority booking" under membership benefits', () => {
    render(<CustomerBenefits />);
    // Use a function to match the text content, ignoring the <strong> tag
    expect(screen.getByText((content, element) => {
      const hasText = (node) => node.textContent.includes('Priority booking - members can book tickets up to 7 days in advance');
      const elementHasText = hasText(element);
      const childrenDontHaveText = Array.from(element.children).every(
        (child) => !hasText(child)
      );
      return elementHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });

  // Test Case 5: Renders the "Service Guarantees" section heading
  test('5. Renders the "Service Guarantees" section heading', () => {
    render(<CustomerBenefits />);
    expect(screen.getByRole('heading', { name: /service guarantees:/i, level: 2 })).toBeInTheDocument();
  });

  // Test Case 6: Renders a specific service guarantee (updated to handle text split by <strong>)
  test('6. Renders "Clean and comfortable facilities" under service guarantees', () => {
    render(<CustomerBenefits />);
    // Use a function to match the text content, ignoring the <strong> tag
    expect(screen.getByText((content, element) => {
      const hasText = (node) => node.textContent.includes('Clean and comfortable facilities - we maintain high standards of cleanliness and comfort');
      const elementHasText = hasText(element);
      const childrenDontHaveText = Array.from(element.children).every(
        (child) => !hasText(child)
      );
      return elementHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });

  // Test Case 7: Renders the "Additional Rights" section heading
  test('7. Renders the "Additional Rights" section heading', () => {
    render(<CustomerBenefits />);
    expect(screen.getByRole('heading', { name: /additional rights:/i, level: 2 })).toBeInTheDocument();
  });

  // Test Case 8: Renders a specific additional right (updated to handle text split by <strong>)
  test('8. Renders "Privacy protection" under additional rights', () => {
    render(<CustomerBenefits />);
    // Use a function to match the text content, ignoring the <strong> tag
    expect(screen.getByText((content, element) => {
      const hasText = (node) => node.textContent.includes('Privacy protection - we safeguard your personal information');
      const elementHasText = hasText(element);
      const childrenDontHaveText = Array.from(element.children).every(
        (child) => !hasText(child)
      );
      return elementHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });

  // Test Case 9: Renders the concluding feedback paragraph
  test('9. Renders the concluding paragraph about feedback', () => {
    render(<CustomerBenefits />);
    expect(screen.getByText(/movietheater is dedicated to continuous improvement of our services/i)).toBeInTheDocument();
  });

  // Test Case 10: Renders the "Become a Member Today" link with correct href
  test('10. Renders the "Become a Member Today" link with correct href', () => {
    render(<CustomerBenefits />);
    const memberLink = screen.getByRole('link', { name: /become a member today/i });
    expect(memberLink).toBeInTheDocument();
    expect(memberLink).toHaveAttribute('href', '/register');
  });
});
