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
import { motion } from 'framer-motion'; // Import motion for animations

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
          revenueArr: dailySorted.map(([, r]) => {
            const val = +(r / 1e6).toFixed(2);
            return isNaN(val) ? 0 : val;
          }),
        });
        setMonthlyRevenue({
          categories: monthlySorted.map(([m]) => m),
          revenueArr: monthlySorted.map(([, r]) => {
            const val = +(r / 1e6).toFixed(2);
            return isNaN(val) ? 0 : val;
          }),
        });

      } catch (err) {
        console.error('Error fetching booking data:', err);
      }
    };

    fetchData();
  }, []);

  const top5BookedFilms = topBookedFilms.slice(0, 5);
  const pieData = {
    labels: top5BookedFilms.map(f => f.name),
    datasets: [
      {
        data: top5BookedFilms.map(f => f.count),
        backgroundColor: ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
        borderColor: '#0f172a', // slate-900
        borderWidth: 1,
      },
    ],
  };

  const baseChartOptions = {
    chart: { toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
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
    grid: {
      borderColor: '#475569', // slate-600 for grid lines
      strokeDashArray: 4,
    }
  };

  const dailyOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: 'area',
    },
    xaxis: {
      ...baseChartOptions.xaxis,
      categories: dailyRevenue.categories || [],
    },
  };

  const dailySeries = [
    {
      name: "Revenue (million)",
      data: dailyRevenue.revenueArr || [],
    },
  ];

  const monthlyOptions = {
    ...baseChartOptions,
    chart: {
      ...baseChartOptions.chart,
      type: 'bar',
    },
    xaxis: {
      ...baseChartOptions.xaxis,
      categories: monthlyRevenue.categories || [],
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '25%',
        borderRadius: 4,
      },
    },
  };

  const monthlySeries = [
    {
      name: "Revenue (million)",
      data: monthlyRevenue.revenueArr || [],
    },
  ];

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
    { value: totalMovies, label: 'Total Movies', color: 'from-gray-500 to-gray-600' },
    { value: nowShowing, label: 'Now Showing', color: 'from-red-500 to-red-600' },
    { value: comingSoon, label: 'Coming Soon', color: 'from-yellow-500 to-yellow-600' },
  ];

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Admin Dashboard
              </h1>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div
              className="w-full max-w-full mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: '20px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {stats.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 * i }}
                      className={`bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-600/30 transition-all duration-300 hover:scale-[1.02] shadow-md`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${s.color} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        {/* You can add icons here if desired, e.g., <FilmOutlined /> */}
                      </div>
                      <p className="text-slate-300 text-sm md:text-base">{s.label}</p>
                      <h2 className="text-xl md:text-3xl font-bold text-white mt-1">{s.value}</h2>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30 mb-8"
                >
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">⚡</span> {/* Placeholder icon */}
                    </div>
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      to="/admin/add-movie"
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-center flex items-center justify-center"
                      style={{ height: '48px' }}
                    >
                      Add Movie
                    </Link>
                    <Link
                      to="/admin/view-members"
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-none text-white hover:text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-xl text-center flex items-center justify-center"
                      style={{ height: '48px' }}
                    >
                      View Accounts
                    </Link>
                  </div>
                </motion.div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📈</span> {/* Placeholder icon */}
                      </div>
                      Most Booked Movies (Last 30 Days)
                    </h2>
                    <div className="flex justify-center h-[250px] md:h-[300px]"> {/* Added height for responsiveness */}
                      {top5BookedFilms.length > 0 ? (
                        <Pie
                          data={pieData}
                          options={{
                            maintainAspectRatio: false,
                            responsive: true, // Ensure responsiveness
                            plugins: {
                              legend: {
                                labels: {
                                  color: 'white', // Ensure legend text is white
                                  font: {
                                    size: 13, // Adjust font size for readability
                                  }
                                },
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += context.parsed;
                                    }
                                    return label;
                                  }
                                },
                                titleColor: '#e2e8f0', // gray-200
                                bodyColor: '#cbd5e1', // gray-300
                                backgroundColor: 'rgba(30, 41, 59, 0.9)', // slate-800 with transparency
                                borderColor: '#475569', // slate-600
                                borderWidth: 1,
                                boxPadding: 5,
                                displayColors: true,
                                bodyFont: {
                                  size: 13,
                                }
                              }
                            },
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center flex items-center justify-center h-full">No booking data available.</div>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">💸</span> {/* Placeholder icon */}
                      </div>
                      Top 6 Highest Grossing Movies (Last 30 Days)
                    </h2>
                    <div className="space-y-4">
                      {topRevenueFilms.length > 0 ? (
                        topRevenueFilms.map((film, i) => {
                          const max = Math.max(...topRevenueFilms.map(f => f.revenue), 1);
                          return (
                            <div key={i} className="flex items-center">
                              <div className="w-1/3 text-right pr-4 text-gray-300 text-sm truncate">{film.name}</div>
                              <div className="w-2/3 relative h-8 bg-slate-700 rounded-sm overflow-hidden">
                                <div
                                  className="absolute top-0 left-0 h-8 bg-blue-500 rounded-sm"
                                  style={{ width: `${(film.revenue / max) * 100}%` }}
                                ></div>
                                <div className="absolute inset-0 flex items-center justify-end pr-2 text-white font-medium text-sm">
                                  {film.revenue.toLocaleString('vi-VN')} Million
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-gray-400 text-center flex items-center justify-center h-full">No revenue data available.</div>
                      )}
                    </div>
                    <div className="mt-4 text-right text-xs text-gray-400">Revenue (million VND)</div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                    className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📊</span> {/* Placeholder icon */}
                      </div>
                      Daily Revenue
                    </h2>
                    {dailyRevenue.categories.length > 0 && dailyRevenue.revenueArr.length > 0 ? (
                      <Chart options={dailyOptions} series={dailySeries} type="area" height={300} />
                    ) : (
                      <div className="text-gray-400 text-center flex items-center justify-center h-[300px]">No daily revenue data available.</div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="bg-slate-900/30 backdrop-blur-sm rounded-2xl p-6 border border-slate-600/30"
                  >
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📈</span> {/* Placeholder icon */}
                      </div>
                      Monthly Revenue
                    </h2>
                    {monthlyRevenue.categories.length > 0 && monthlyRevenue.revenueArr.length > 0 ? (
                      <Chart options={monthlyOptions} series={monthlySeries} type="bar" height={300} />
                    ) : (
                      <div className="text-gray-400 text-center flex items-center justify-center h-[300px]">No monthly revenue data available.</div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </SidebarLayout>
  );
}

export default AdminDashboard;
