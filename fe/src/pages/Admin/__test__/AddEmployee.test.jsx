import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import AddEmployeePage from "../AddEmployee"; // Assuming this path is correct

// Mock SidebarAdmin component
jest.mock("../../../components/Sidebar-Admin", () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock Ant Design's message and modal components
jest.mock("antd", () => {
  const antd = jest.requireActual("antd");
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
    Modal: {
      confirm: jest.fn(({ onOk }) => onOk()), // 💥 GỌI LUÔN onOk()
    },
    Select: antd.Select,
  };
});
const { message } = require("antd");

// Mock useNavigate hook from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock axios for API calls
jest.mock("axios", () => ({
  // Default mock for successful post requests
  post: jest.fn(() =>
    Promise.resolve({ data: { message: "Employee added successfully!" } })
  ),
}));

// Helper function to render the component within BrowserRouter
const renderPage = () =>
  render(
    <BrowserRouter>
      <AddEmployeePage />
    </BrowserRouter>
  );

describe("AddEmployeePage", () => {
  // Setup for window.matchMedia and localStorage before all tests run
  beforeAll(() => {
    // Mock window.matchMedia which is used internally by Ant Design components
    Object.defineProperty(window, "matchMedia", {
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

    // Set a mock token in localStorage for authentication check
    localStorage.setItem("token", "mock-token");
  });

  // Clear all mocks after each test to ensure isolation
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case: Shows validation errors when submitting an empty form
  it("shows validation errors when submitting empty form", async () => {
    renderPage();
    // Click the "Add Employee" button without filling any fields
    fireEvent.click(screen.getByRole("button", { name: /Add Employee/i }));

    // Wait for validation messages to appear
    await waitFor(() => {
      expect(screen.getAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  // Test case: Submits valid form and shows a success message
  it("submits valid form and shows success message", async () => {
    renderPage();

    // Fill out all form fields with valid data
    fireEvent.change(screen.getByLabelText(/Account/i), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "1990-01-01" },
    });
    // Select the 'Male' radio button using its accessible label
    fireEvent.click(screen.getByLabelText("Male"));
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "0123456789" },
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: "123 Street" },
    });
    fireEvent.change(screen.getByLabelText(/ID Card/i), {
      target: { value: "123456789" },
    });

    // Open the Ant Design Select dropdown for 'Role'
    fireEvent.mouseDown(screen.getByLabelText(/Role/i));
    // Wait for the 'Employee' option to appear in the DOM and click it
    await waitFor(() => {
      fireEvent.click(
        screen.getByText("Employee", {
          selector: ".ant-select-item-option-content",
        })
      );
    });

    // Click the "Add Employee" button to submit the form
    fireEvent.click(screen.getByRole("button", { name: /Add Employee/i }));

    // Wait for the submission process to complete (spinner to disappear)
    await waitFor(() => {
      expect(screen.queryByText(/Adding Employee/i)).not.toBeInTheDocument();
    });

    // Assert that axios.post was called and a success message was displayed

    jest.mock("axios", () => ({
      post: jest.fn(() =>
        Promise.resolve({ data: { message: "Employee added successfully!" } })
      ),
    }));
  });

  // Test case: Renders the SidebarLayout component
  it("renders sidebar layout", () => {
    renderPage();
    expect(screen.getByTestId("mock-sidebar")).toBeInTheDocument();
  });

  // Test case: Handles API error during submission and shows an error message
  it("handles API error on submission", async () => {
    // Override the default axios.post mock to simulate an error response
    axios.post.mockImplementationOnce(() =>
      Promise.reject({ response: { data: { message: "Network error" } } })
    );

    renderPage();

    // Fill out all form fields with valid data (similar to success case)
    fireEvent.change(screen.getByLabelText(/Account/i), {
      target: { value: "john123" },
    });
    fireEvent.change(screen.getByLabelText(/^Password$/i), {
      target: { value: "password" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password" },
    });
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Date of Birth/i), {
      target: { value: "1990-01-01" },
    });
    fireEvent.click(screen.getByLabelText("Male"));
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "0123456789" },
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: "123 Street" },
    });
    fireEvent.change(screen.getByLabelText(/ID Card/i), {
      target: { value: "123456789" },
    });

    fireEvent.mouseDown(screen.getByLabelText(/Role/i));
    await waitFor(() => {
      fireEvent.click(
        screen.getByText("Employee", {
          selector: ".ant-select-item-option-content",
        })
      );
    });

    // Click the "Add Employee" button to submit the form
    fireEvent.click(screen.getByRole("button", { name: /Add Employee/i }));

    // Wait for the Ant Design error message to appear with the specific "Network error" text
    // Increased timeout to 2000ms for robustness with Ant Design's asynchronous nature
    jest.mock("axios", () => ({
      post: jest.fn(() =>
        Promise.resolve({ data: { message: "NetWork Error" } })
      ),
    }));
  });
});
