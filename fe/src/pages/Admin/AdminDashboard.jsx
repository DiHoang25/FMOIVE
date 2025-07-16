import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import axios from 'axios';
import Chart from 'react-apexcharts';
import { Pie } from 'react-chartjs-2';
import dayjs from 'dayjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function AdminDashboard() {
  const [topRevenueFilms, setTopRevenueFilms] = useState([]);
  const [topBookedFilms, setTopBookedFilms] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState({ revenueArr: [], categories: [] });
  const [monthlyRevenue, setMonthlyRevenue] = useState({ revenueArr: [], categories: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/booking-management', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          params: { status: 'PAID' },
        });

        const bookings = data.bookings;
        const revenueMap = {}, countMap = {}, dailyMap = {}, monthlyMap = {};

        bookings.forEach(b => {
          const name = b.movieDetails?.name;
          const rev = b.grandTotal ?? b.totalPrice ?? 0;
          if (!name) return;

          revenueMap[name] = (revenueMap[name] || 0) + rev;
          countMap[name] = (countMap[name] || 0) + 1;

          const date = new Date(b.createdAt);
          const day = date.toLocaleDateString("vi-VN");
          const month = `${date.getMonth() + 1}/${date.getFullYear()}`;

          dailyMap[day] = (dailyMap[day] || 0) + rev;
          monthlyMap[month] = (monthlyMap[month] || 0) + rev;
        });

        const revenueArr = Object.entries(revenueMap)
          .map(([name, rev]) => ({ name, revenue: +(rev / 1e6).toFixed(2) }))
          .sort((a, b) => b.revenue - a.revenue).slice(0, 6);

        const countArr = Object.entries(countMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count).slice(0, 6);

        let dailySorted = Object.entries(dailyMap).sort(
          ([a], [b]) => new Date(a.split('/').reverse().join('/')) - new Date(b.split('/').reverse().join('/'))
        );
        dailySorted = dailySorted.slice(-7);

        const monthlySorted = Object.entries(monthlyMap).sort(([a], [b]) => {
          const [m1, y1] = a.split('/').map(Number);
          const [m2, y2] = b.split('/').map(Number);
          return new Date(y1, m1 - 1) - new Date(y2, m2 - 1);
        });

        setTopRevenueFilms(revenueArr);
        setTopBookedFilms(countArr);
        setDailyRevenue({
          categories: dailySorted.map(([d]) => d),
          revenueArr: dailySorted.map(([, r]) => +(r / 1e6).toFixed(2)),
        });
        setMonthlyRevenue({
          categories: monthlySorted.map(([m]) => m),
          revenueArr: monthlySorted.map(([, r]) => +(r / 1e6).toFixed(2)),
        });

      } catch (err) {
        console.error('Error fetching booking data:', err);
      }
    };

    fetchData();
  }, []);

  const pieData = {
    labels: topBookedFilms.map(f => f.name),
    datasets: [
      {
        data: topBookedFilms.map(f => f.count),
        backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'],
        borderColor: '#0f172a',
        borderWidth: 1,
      },
    ],
  };

  const baseChartOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    tooltip: {
      enabled: true,
      style: {
        fontSize: '13px',
        fontFamily: 'Inter, sans-serif',
      },
      theme: 'dark',
      x: {
        format: 'dd/MM/yyyy',
      },
      marker: {
        fillColors: ['#3B82F6'],
      },
    },
    markers: {
      size: 5,
      colors: ['#3B82F6'],
      strokeColors: '#ffffff',
      strokeWidth: 2,
    },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.6, opacityTo: 0, gradientToColors: ["#3B82F6"] },
    },
    dataLabels: { enabled: false },
    stroke: { width: 3, curve: "smooth" },
    yaxis: { labels: { style: { colors: "#ccc" } } },
    xaxis: { labels: { rotate: -45, style: { colors: "#ccc" } } },
  };

  const dailyOptions = {
    ...baseChartOptions,
    xaxis: { ...baseChartOptions.xaxis, categories: dailyRevenue.categories },
    series: [{ name: "Doanh thu (triệu)", data: dailyRevenue.revenueArr }],
  };

  const monthlyOptions = {
    ...baseChartOptions,
    xaxis: { ...baseChartOptions.xaxis, categories: monthlyRevenue.categories },
    series: [{ name: "Doanh thu (triệu)", data: monthlyRevenue.revenueArr }],
  };

  const [movies, setMovies] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [nowShowing, setNowShowing] = useState(0);
  const [comingSoon, setComingSoon] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/movies');
        const sortedMovies = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setMovies(sortedMovies);

        const today = dayjs();
        setTotalMovies(sortedMovies.length);
        setNowShowing(sortedMovies.filter(movie => {
          const start = dayjs(movie.start_date);
          const end = dayjs(movie.end_date);
          return today.isAfter(start) && today.isBefore(end);
        }).length);
        setComingSoon(sortedMovies.filter(movie => dayjs(movie.start_date).isAfter(today)).length);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovies();
  }, []);

  const stats = [
    { value: totalMovies, label: 'Total Movies' },
    { value: nowShowing, label: 'Now Showing' },
    { value: comingSoon, label: 'Coming Soon' },
  ];

  return (
    <SidebarLayout>
      <div className="p-1">
        <main className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((s, i) => (
              <div key={i} className={`rounded-lg p-4 text-center shadow ${i === 0 ? 'bg-gray-700' : i === 1 ? 'bg-green-700' : i === 2 ? 'bg-yellow-600' : 'bg-blue-600'}`}>
                <p className="text-sm text-white">{s.label}</p>
                <h2 className="text-xl font-bold text-white">{s.value}</h2>
              </div>
            ))}
          </div>
          <div className="bg-slate-800 p-4 rounded-md mb-6">
            <h2 className="text-xl text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link to="/admin/add-movie" className="bg-green-500 hover:bg-green-600 text-white hover:text-white p-3 rounded-md text-center">
                Add Movie
              </Link>
              <Link to="/admin/view-members" className="bg-blue-500 hover:bg-blue-600 text-white hover:text-white p-3 rounded-md text-center">
                View Accounts
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-800 p-4 rounded-md">
              <h2 className="text-base text-white mb-4 text-center font-semibold">Most Booked Movies (Last 30 Days)</h2>
              <div className="flex justify-center">
                <Pie
                  data={pieData}
                  width={220}
                  height={220}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="bg-slate-800 p-2 rounded-md">
              <h2 className="text-base text-white mb-4 text-center font-semibold">Top 6 Highest Grossing Movies (Last 30 Days)</h2>
              <div className="space-y-4">
                {topRevenueFilms.map((film, i) => {
                  const max = Math.max(...topRevenueFilms.map(f => f.revenue), 1);
                  return (
                    <div key={i} className="flex items-center">
                      <div className="w-1/3 text-right pr-4 text-gray-300">{film.name}</div>
                      <div className="w-2/3 relative h-8">
                        <div
                          className="absolute top-0 left-0 h-8 bg-blue-500 rounded-sm"
                          style={{ width: `${(film.revenue / max) * 100}%` }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-end pr-2 text-white font-medium">
                          {film.revenue.toLocaleString('vi-VN')} triệu
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 text-right text-xs text-gray-400">Doanh thu (triệu đồng)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800 p-4 rounded-md">
              <h2 className="text-white mb-4 text-center font-semibold">Daily Revenue</h2>
              <Chart options={dailyOptions} series={dailyOptions.series} type="area" height={300} />
            </div>
            <div className="bg-slate-800 p-4 rounded-md">
              <h2 className="text-white mb-4 text-center font-semibold">Monthly Revenue</h2>
              <Chart options={monthlyOptions} series={monthlyOptions.series} type="area" height={300} />
            </div>
          </div>
        </main>
      </div>
    </SidebarLayout>
  );
}

export default AdminDashboard;
