import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "../AdminDashboard";
import { BrowserRouter } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";

// Mock component layout
jest.mock("../../../components/Sidebar-Admin", () => ({ children }) => (
  <div data-testid="mock-sidebar">{children}</div>
));

// Mock Chart components
// Chúng ta mock ApexCharts để có thể kiểm tra các props options và series
jest.mock("react-apexcharts", () => ({ options, series, type, height }) => (
  <div data-testid={`apex-chart-${type}`}>
    <div data-testid="apex-chart-options">{JSON.stringify(options)}</div>
    <div data-testid="apex-chart-series">{JSON.stringify(series)}</div>
  </div>
));
// Chúng ta mock Chart.js Pie để có thể kiểm tra các props data
jest.mock("react-chartjs-2", () => ({
  Pie: ({ data, options }) => (
    <div data-testid="pie-chart">
      <div data-testid="pie-chart-data">{JSON.stringify(data)}</div>
    </div>
  ),
}));

// Mock axios để kiểm soát các cuộc gọi API
jest.mock("axios");

// Hàm renderPage được làm async để đảm bảo tất cả các cập nhật state được bao bọc trong act()
const renderPage = async () =>
  render(
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <AdminDashboard />
    </BrowserRouter>
  );

describe("AdminDashboard", () => {
  beforeEach(() => {
    // Xóa tất cả các mock trước mỗi test
    jest.clearAllMocks();
    // Đặt token vào localStorage để component không bị chuyển hướng
    localStorage.setItem("token", "mock-token");

    // Lấy ngày hiện tại và các ngày liên quan để mock dữ liệu nhất quán
    const today = dayjs();
    const oneWeekAgo = today.subtract(7, "day");
    const oneMonthAgo = today.subtract(1, "month"); // Thay đổi từ 2 tháng trước thành 1 tháng trước

    // Mock phản hồi API cho axios.get
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/booking-management")) {
        return Promise.resolve({
          data: {
            bookings: [
              {
                movieDetails: { name: "Movie A" },
                grandTotal: 2000000, // 2 triệu VND
                createdAt: today.toISOString(), // Hôm nay
              },
              {
                movieDetails: { name: "Movie B" },
                totalPrice: 1500000, // 1.5 triệu VND
                createdAt: today.toISOString(), // Hôm nay
              },
              {
                movieDetails: { name: "Movie A" }, // Một booking khác cho Movie A
                grandTotal: 1000000,
                createdAt: oneWeekAgo.toISOString(), // Một tuần trước
              },
              {
                movieDetails: { name: "Movie C" }, // Booking đầu tiên cho Movie C
                grandTotal: 500000,
                createdAt: oneMonthAgo.toISOString(), // Một tháng trước
              },
              {
                movieDetails: { name: "Movie C" }, // Booking thứ hai cho Movie C
                grandTotal: 250000,
                createdAt: today.toISOString(), // Hôm nay
              },
            ],
          },
        });
      }

      if (url.includes("/api/movies")) {
        return Promise.resolve({
          data: [
            {
              name: "Movie A",
              start_date: today.subtract(10, "day").format("YYYY-MM-DD"), // Bắt đầu 10 ngày trước
              end_date: today.add(10, "day").format("YYYY-MM-DD"), // Kết thúc trong 10 ngày (Đang chiếu)
              createdAt: "2025-07-01T00:00:00Z",
            },
            {
              name: "Movie B",
              start_date: today.add(5, "day").format("YYYY-MM-DD"), // Bắt đầu trong 5 ngày (Sắp chiếu)
              end_date: today.add(20, "day").format("YYYY-MM-DD"),
              createdAt: "2025-07-15T00:00:00Z",
            },
            {
              name: "Movie D (Old Movie)",
              start_date: today.subtract(30, "day").format("YYYY-MM-DD"),
              end_date: today.subtract(10, "day").format("YYYY-MM-DD"), // Đã kết thúc
              createdAt: "2025-06-01T00:00:00Z",
            },
            {
              name: "Movie E (Future Movie)",
              start_date: today.add(30, "day").format("YYYY-MM-DD"), // Tương lai xa (Sắp chiếu)
              end_date: today.add(60, "day").format("YYYY-MM-DD"),
              createdAt: "2025-07-20T00:00:00Z",
            },
          ],
        });
      }
      return Promise.reject(new Error("not found")); // Trả về lỗi nếu không có URL nào khớp
    });
  });

  afterEach(() => {
    // Xóa token sau mỗi test
    localStorage.removeItem("token");
  });

  it("renders Admin Dashboard title", async () => {
    await renderPage(); // Đợi render và các side effect hoàn tất
    expect(screen.getByText(/Admin Dashboard/i)).toBeInTheDocument();
  });

  it("renders sidebar layout", async () => {
    await renderPage(); // Đợi render và các side effect hoàn tất
    expect(await screen.findByTestId("mock-sidebar")).toBeInTheDocument();
  });

  // --- Movie Stats Cards ---
  it("displays correct movie stats", async () => {
    await renderPage(); // Đợi render và các side effect hoàn tất

    await waitFor(() => {
      // Tổng số phim: 4 (Movie A, B, D, E từ dữ liệu mock)
      expect(screen.getByText("Total Movies")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();

      // Đang chiếu: Movie A (hôm nay nằm giữa ngày bắt đầu và ngày kết thúc)
      expect(screen.getByText("Now Showing")).toBeInTheDocument();
      expect(screen.getByText("1")).toBeInTheDocument(); // Chỉ có Movie A là "Now Showing"

      // Sắp chiếu: Movie B, Movie E (ngày bắt đầu sau hôm nay)
      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument(); // Movie B và E là "Coming Soon"
    });
  });

  // --- Quick Actions ---
  it("renders quick action links with correct text and navigation", async () => {
    await renderPage(); // Đợi render và các side effect hoàn tất

    const addMovieLink = await screen.findByText("Add Movie");
    expect(addMovieLink).toBeInTheDocument();
    expect(addMovieLink).toHaveAttribute("href", "/admin/add-movie");

    const viewAccountsLink = screen.getByText("View Accounts");
    expect(viewAccountsLink).toBeInTheDocument();
    expect(viewAccountsLink).toHaveAttribute("href", "/admin/view-members");
  });

  // --- Charts ---
  it("renders all charts (Pie, Daily Revenue, Monthly Revenue)", async () => {
    await renderPage(); // Đợi render và các side effect hoàn tất

    await waitFor(() => {
      expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
      expect(screen.getByTestId("apex-chart-area")).toBeInTheDocument(); // Biểu đồ doanh thu hàng ngày là biểu đồ khu vực
      expect(screen.getByTestId("apex-chart-bar")).toBeInTheDocument(); // Biểu đồ doanh thu hàng tháng là biểu đồ cột
    });
  });

  it('displays "No booking data available" if no bookings are returned', async () => {
    // Mock API để trả về dữ liệu rỗng hoặc lỗi
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/booking-management")) {
        return Promise.resolve({ data: { bookings: [] } });
      }
      if (url.includes("/api/movies")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error("not found"));
    });

    await renderPage(); // Đợi render và các side effect hoàn tất

    await waitFor(() => {
      expect(
        screen.getByText("No booking data available.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No revenue data available.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No daily revenue data available.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No monthly revenue data available.")
      ).toBeInTheDocument();
    });
  });

  it('displays correct data in "Most Booked Movies" (Pie Chart)', async () => {
    await renderPage(); // Đợi render và các side effect hoàn tất

    await waitFor(() => {
      // Logic dữ liệu mock:
      // Movie A: 2 bookings
      // Movie B: 1 booking
      // Movie C: 2 bookings
      // Thứ tự expected dựa trên số lượng booking (giảm dần) và theo thứ tự bảng chữ cái nếu bằng nhau
      const pieChartDataElement = screen.getByTestId("pie-chart-data");
      const pieChartData = JSON.parse(pieChartDataElement.textContent);

      expect(pieChartData.labels).toEqual(["Movie A", "Movie C", "Movie B"]);
      expect(pieChartData.datasets[0].data).toEqual([2, 2, 1]); // Số lượng booking cho Movie A, C, B
    });
  });

  it('displays correct data in "Top 6 Highest Grossing Movies"', async () => {
    await renderPage();

    await waitFor(() => {
      // Movie A: 2,000,000 + 1,000,000 = 3,000,000 VND = 3.00 Million
      // Với toLocaleString('vi-VN'), 3.00 sẽ hiển thị là "3"
      expect(screen.getByText('3 Million')).toBeInTheDocument();
      
      // Movie B: 1,500,000 VND = 1.50 Million 
      // Với toLocaleString('vi-VN'), 1.50 sẽ hiển thị là "1,5"
      expect(screen.getByText('1,5 Million')).toBeInTheDocument();
      
      // Movie C: 500,000 + 250,000 = 750,000 VND = 0.75 Million
      // Với toLocaleString('vi-VN'), 0.75 sẽ hiển thị là "0,75"
      expect(screen.getByText('0,75 Million')).toBeInTheDocument();
    });
  });

  it("displays correct data for Daily Revenue chart", async () => {
    await renderPage(); // Đợi render và các side effect hoàn tất

    await waitFor(() => {
      const dailyChartOptionsElement = screen
        .getByTestId("apex-chart-area")
        .querySelector('[data-testid="apex-chart-options"]');
      const dailyChartSeriesElement = screen
        .getByTestId("apex-chart-area")
        .querySelector('[data-testid="apex-chart-series"]');

      const dailyOptions = JSON.parse(dailyChartOptionsElement.textContent);
      const dailySeries = JSON.parse(dailyChartSeriesElement.textContent);

      const todayFormatted = dayjs().toDate().toLocaleDateString("vi-VN");
      const oneWeekAgoFormatted = dayjs()
        .subtract(7, "day")
        .toDate()
        .toLocaleDateString("vi-VN");

      expect(dailyOptions.xaxis.categories).toContain(todayFormatted);
      expect(dailyOptions.xaxis.categories).toContain(oneWeekAgoFormatted);

      // Doanh thu hàng ngày cho hôm nay: Movie A (2M) + Movie B (1.5M) + Movie C (0.25M) = 3.75M
      // Doanh thu hàng ngày cho một tuần trước: Movie A (1M) = 1M
      expect(dailySeries[0].data).toContain(3.75);
      expect(dailySeries[0].data).toContain(1.0);
    });
  });

  it("displays correct data for Monthly Revenue chart", async () => {
    await renderPage(); // Đợi render và các side effect hoàn tất

    await waitFor(() => {
      const monthlyChartOptionsElement = screen
        .getByTestId("apex-chart-bar")
        .querySelector('[data-testid="apex-chart-options"]');
      const monthlyChartSeriesElement = screen
        .getByTestId("apex-chart-bar")
        .querySelector('[data-testid="apex-chart-series"]');

      const monthlyOptions = JSON.parse(monthlyChartOptionsElement.textContent);
      const monthlySeries = JSON.parse(monthlyChartSeriesElement.textContent);

      const today = dayjs();
      // Định dạng tháng/năm, ví dụ: 7/2025
      const currentMonthYear = `${today.month() + 1}/${today.year()}`;
      const oneMonthAgoMonthYear = `${
        today.subtract(1, "month").month() + 1
      }/${today.subtract(1, "month").year()}`;

      expect(monthlyOptions.xaxis.categories).toContain(currentMonthYear);
      expect(monthlyOptions.xaxis.categories).toContain(oneMonthAgoMonthYear);

      // Tổng doanh thu cho tháng hiện tại (booking hôm nay + 1 tuần trước): 2M + 1.5M + 0.25M (hôm nay) + 1M (1 tuần trước) = 4.75M
      // Tổng doanh thu cho tháng trước (booking 1 tháng trước): 0.5M
      expect(monthlySeries[0].data).toContain(4.75);
      expect(monthlySeries[0].data).toContain(0.5);
    });
  });

  it("handles API errors gracefully for bookings", async () => {
    // Mock API trả về lỗi cho booking-management
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/booking-management")) {
        return Promise.reject(new Error("Network Error"));
      }
      if (url.includes("/api/movies")) {
        return Promise.resolve({ data: [] }); // Vẫn mock dữ liệu phim để tránh các lỗi khác
      }
      return Promise.reject(new Error("not found"));
    });

    // Theo dõi console.error để kiểm tra xem lỗi có được log không
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await renderPage(); // Đợi render và các side effect hoàn tất

    await waitFor(() => {
      // Kiểm tra các thông báo dự phòng khi dữ liệu booking thất bại
      expect(
        screen.getByText("No booking data available.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No revenue data available.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No daily revenue data available.")
      ).toBeInTheDocument();
      expect(
        screen.getByText("No monthly revenue data available.")
      ).toBeInTheDocument();
    });

    // Đảm bảo rằng console.error đã được gọi với thông báo lỗi phù hợp
    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching booking data:",
      expect.any(Error)
    );
    consoleSpy.mockRestore(); // Khôi phục console.error
  });

  it("handles API errors gracefully for movies", async () => {
    // Mock API trả về lỗi cho movies
    axios.get.mockImplementation((url) => {
      if (url.includes("/api/booking-management")) {
        return Promise.resolve({ data: { bookings: [] } }); // Vẫn mock dữ liệu booking
      }
      if (url.includes("/api/movies")) {
        return Promise.reject(new Error("Movie API Error"));
      }
      return Promise.reject(new Error("not found"));
    });

    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await renderPage(); // Đợi render và các side effect hoàn tất

    await waitFor(() => {
      // Mong đợi số liệu phim là 0 hoặc hiển thị trạng thái mặc định
      expect(screen.getByText("Total Movies")).toBeInTheDocument();
      expect(screen.getAllByText("0")).toHaveLength(3); // Total, Now Showing, Coming Soon phải là 0
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching movies:",
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});