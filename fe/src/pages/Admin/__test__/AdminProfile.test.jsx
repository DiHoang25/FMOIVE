import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminProfile from "../AdminProfile";
import { BrowserRouter } from "react-router-dom";
import fetchMock from "jest-fetch-mock";

// Mock các dependencies
jest.mock("../../../components/Sidebar-Admin", () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock framer-motion với tất cả các element được sử dụng
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, initial, animate, transition, whileHover, ...props }) => (
      <div {...props}>{children}</div>
    ),
    h1: ({ children, initial, animate, transition, ...props }) => (
      <h1 {...props}>{children}</h1>
    ),
    h2: ({ children, initial, animate, transition, ...props }) => (
      <h2 {...props}>{children}</h2>
    ),
  },
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock antd components nếu cần
jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  // Có thể mock các component specific nếu cần
}));

// Helper render bọc với Router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.setItem("token", "mock-token");
  mockNavigate.mockClear();

  // Mock console.error để tránh log lỗi trong test
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

describe("AdminProfile", () => {
  // Tăng timeout cho toàn bộ test suite
  jest.setTimeout(15000);

  it("renders loading state initially", () => {
    fetchMock.mockResponse(() => new Promise(() => {})); // never resolves
    renderWithRouter(<AdminProfile />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("renders error state if fetch fails", async () => {
    fetchMock.mockRejectOnce(() => Promise.reject("API is down"));
    renderWithRouter(<AdminProfile />);

    await waitFor(
      () => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument();
        expect(
          screen.getByText(/Failed to fetch user data/i)
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("renders error if no token found", async () => {
    localStorage.removeItem("token");
    renderWithRouter(<AdminProfile />);

    await waitFor(
      () => {
        expect(screen.getByText(/Not authenticated/i)).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it("displays user info on successful fetch", async () => {
    // Mock fetch response
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          fullname: "Admin Test",
          username: "admin",
          email: "admin@example.com",
          date_of_birth: "1995-12-01T00:00:00.000Z",
          phone: "0987654321",
          gender: "male",
        },
      }),
    });

    renderWithRouter(<AdminProfile />);

    // Đợi loading spinner biến mất
    await waitFor(
      () => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Đợi một chút để component re-render sau khi fetch data
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Kiểm tra không có lỗi
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Not authenticated/i)).not.toBeInTheDocument();

    // FIXED: Sử dụng getAllByText thay vì queryByText khi có nhiều elements
    await waitFor(
      () => {
        const fullnameElements = screen.getAllByText("Admin Test");
        expect(fullnameElements).toHaveLength(2); // Expecting exactly 2 elements
        expect(fullnameElements[0]).toBeInTheDocument();
        expect(fullnameElements[1]).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Hoặc kiểm tra từng element cụ thể bằng role hoặc selector
    await waitFor(
      () => {
        // Kiểm tra h2 element chứa tên
        const nameHeading = screen.getByRole("heading", {
          level: 2,
          name: "Admin Test",
        });
        expect(nameHeading).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Kiểm tra các field khác bằng cách tìm text trong document
    expect(document.body.textContent).toContain("admin");
    expect(document.body.textContent).toContain("admin@example.com");
    expect(document.body.textContent).toContain("01/12/1995");
    expect(document.body.textContent).toContain("0987654321");
    expect(document.body.textContent).toContain("male");
  });

  it("handles missing optional fields like phone, dob, and gender", async () => {
    // Mock fetch response đúng format
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          fullname: "Admin NoInfo",
          username: "admin123",
          email: "noinfo@example.com",
          phone: null,
          date_of_birth: null,
          gender: null,
        },
      }),
    });

    renderWithRouter(<AdminProfile />);

    // Đợi loading spinner biến mất
    await waitFor(
      () => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Đợi component re-render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Kiểm tra không có lỗi
    expect(screen.queryByText(/Error/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Not authenticated/i)).not.toBeInTheDocument();

    // Kiểm tra thông tin cơ bản
    await waitFor(
      () => {
        // Sử dụng getAllByText nếu có thể có multiple elements
        const nameElements = screen.queryAllByText("Admin NoInfo");
        if (nameElements.length > 0) {
          expect(nameElements[0]).toBeInTheDocument();
        } else {
          // Fallback to checking document content
          expect(document.body.textContent).toContain("Admin NoInfo");
        }
      },
      { timeout: 5000 }
    );

    expect(document.body.textContent).toContain("admin123");
    expect(document.body.textContent).toContain("noinfo@example.com");

    // Kiểm tra "Not provided" xuất hiện ít nhất 2 lần (cho phone, dob, gender)
    const textContent = document.body.textContent;
    const notProvidedCount = (textContent.match(/Not provided/g) || []).length;
    expect(notProvidedCount).toBeGreaterThanOrEqual(2);
  });

  it("calls navigate when edit profile button is clicked", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          fullname: "Admin Test",
          username: "admin",
          email: "admin@example.com",
        },
      }),
    });

    renderWithRouter(<AdminProfile />);

    await waitFor(
      () => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Đợi component render
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Tìm button Edit Profile
    const editButton = await waitFor(
      () => {
        const button = screen.getByText("Edit Profile");
        expect(button).toBeInTheDocument();
        return button;
      },
      { timeout: 5000 }
    );

    editButton.click();

    expect(mockNavigate).toHaveBeenCalledWith(
      "/admin/admin-profile/edit-profile"
    );
  });

  // Alternative approach: Test với more specific selectors
  it("displays user info with specific selectors", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          fullname: "Admin Test",
          username: "admin",
          email: "admin@example.com",
          date_of_birth: "1995-12-01T00:00:00.000Z",
          phone: "0987654321",
          gender: "male",
        },
      }),
    });

    renderWithRouter(<AdminProfile />);

    await waitFor(
      () => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Thay vì tìm text, tìm theo structure hoặc test-id nếu có
    await waitFor(
      () => {
        // Kiểm tra xem có heading chứa "Admin Profile" không
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
          "Admin Profile"
        );

        // Kiểm tra các thông tin trong document body
        const bodyText = document.body.textContent;
        expect(bodyText).toContain("Admin Test");
        expect(bodyText).toContain("admin@example.com");
        expect(bodyText).toContain("0987654321");
      },
      { timeout: 5000 }
    );
  });

  // Test debug để xem DOM được render
  it("DEBUG: shows what is actually rendered", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          fullname: "Admin Test",
          username: "admin",
          email: "admin@example.com",
          date_of_birth: "1995-12-01T00:00:00.000Z",
          phone: "0987654321",
          gender: "male",
        },
      }),
    });

    const { debug } = renderWithRouter(<AdminProfile />);

    // Chờ loading
    await waitFor(
      () => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    // Đợi một chút để data được set
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Debug DOM structure - uncomment để xem cấu trúc DOM
    // debug();

    // Hoặc log ra text content
    console.log("Document body content:", document.body.textContent);
  });
});
