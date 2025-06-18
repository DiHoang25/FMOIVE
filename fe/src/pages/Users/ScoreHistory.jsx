import React, { useState, useEffect } from 'react';
import UserDashboardLayout from '../../components/UserDashboardlayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp } from 'lucide-react';

const fakeData = {
add: [
{ movie: 'Avenger: The Infinity war', date: '26/06/2025', point: 20 },
{ movie: 'Avenger: The Infinity war', date: '26/06/2025', point: 20 },
{ movie: 'Avenger: The Infinity war', date: '26/06/2025', point: 20 },
{ movie: 'The Dark Knight', date: '25/06/2025', point: 20 },
{ movie: 'Avenger: The End Game', date: '24/06/2025', point: 20 },
],
use: [
{ movie: 'Spider-Man: No Way Home', date: '26/06/2025', point: -20 },
{ movie: 'Avatar: The Way of Water', date: '25/06/2025', point: -20 },
{ movie: 'Doctor Strange 2', date: '24/06/2025', point: -20 },
],
};

const ScoreHistory = () => {
const [fromDate, setFromDate] = useState(null);
const [toDate, setToDate] = useState(null);
const [result, setResult] = useState({ add: [], use: [] });
const [searched, setSearched] = useState(false);
const [totalScore, setTotalScore] = useState(0);

const calculateTotal = (data) => {
const addPoints = data.add.reduce((sum, item) => sum + item.point, 0);
const usePoints = data.use.reduce((sum, item) => sum + item.point, 0);
return addPoints + usePoints;
};

const handleView = () => {
const formatDate = (date) => format(date, 'dd/MM/yyyy');
const from = fromDate ? formatDate(fromDate) : '';
const to = toDate ? formatDate(toDate) : '';


const isInRange = (d) =>
  (!from || d >= from) && (!to || d <= to);

const filteredAdd = fakeData.add.filter((item) => isInRange(item.date));
const filteredUse = fakeData.use.filter((item) => isInRange(item.date));

const filteredResult = { add: filteredAdd, use: filteredUse };
setResult(filteredResult);
setSearched(true);
setTotalScore(calculateTotal(filteredResult));
};

useEffect(() => {
// Khi load lần đầu, hiển thị toàn bộ dữ liệu
const initialData = { add: fakeData.add, use: fakeData.use };
setResult(initialData);
setSearched(true);
setTotalScore(calculateTotal(initialData));
}, []);

return (
<UserDashboardLayout>
<h2 className="text-2xl font-bold text-white mb-2">Score History</h2>
<p className="text-gray-300 mb-6">
Track your reward points for movie purchases and redemptions
</p>


  {/* Filter */}
  <div className="bg-[#0d1117] border border-gray-700 rounded-md mb-8">
    <div className="border-b border-gray-700 p-4 font-semibold text-white flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-red-500">⬤</span> Filter Score History
      </div>
      <div className="text-xl">
        Total Points: <span className="font-bold text-green-500">{totalScore}</span>
      </div>
    </div>

    <div className="p-4 flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <label className="text-sm text-gray-300 block mb-1">From Date</label>
        <DatePicker
          selected={fromDate}
          onChange={(date) => setFromDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="DD/MM/YYYY"
          className="w-full px-3 py-2 rounded bg-[#1c1f26] text-white border border-gray-600"
          inputReadOnly
          onKeyDown={(e) => e.preventDefault()}
        />
      </div>
      <div className="flex-1">
        <label className="text-sm text-gray-300 block mb-1">To Date</label>
        <DatePicker
          selected={toDate}
          onChange={(date) => setToDate(date)}
          dateFormat="dd/MM/yyyy"
          placeholderText="DD/MM/YYYY"
          className="w-full px-3 py-2 rounded bg-[#1c1f26] text-white border border-gray-600"
          inputReadOnly
          onKeyDown={(e) => e.preventDefault()}
        />
      </div>
      <div className="flex items-end">
        <button
          onClick={handleView}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
        >
          View Score
        </button>
      </div>
    </div>
  </div>

  {/* No Data */}
  {searched && result.add.length === 0 && result.use.length === 0 && (
    <div className="text-center text-red-400 mt-8 text-lg">
      No score data found for the selected date range.
    </div>
  )}

  {/* Score Add */}
  {result.add.length > 0 && (
    <div className="bg-[#0d1117] border border-gray-700 rounded-md mb-8">
      <div className="border-b border-gray-700 p-4 font-semibold text-green-400 flex items-center gap-2">
        <ArrowUp size={16} /> Score Adding History
      </div>
      <ul className="divide-y divide-gray-800">
        {result.add.map((item, idx) => (
          <li key={idx} className="px-4 py-3 text-white flex justify-between items-center">
            <span>
              {item.movie}{' '}
              <span className="text-gray-400 text-sm">(Movie Purchased)</span>
              <span className="ml-4 text-gray-400 text-sm">{item.date}</span>
            </span>
            <span className="text-green-500 font-bold">+{item.point} points</span>
          </li>
        ))}
      </ul>
    </div>
  )}

  {/* Score Use */}
  {result.use.length > 0 && (
    <div className="bg-[#0d1117] border border-gray-700 rounded-md mb-8">
      <div className="border-b border-gray-700 p-4 font-semibold text-red-400 flex items-center gap-2">
        <ArrowDown size={16} /> Score Using History
      </div>
      <ul className="divide-y divide-gray-800">
        {result.use.map((item, idx) => (
          <li key={idx} className="px-4 py-3 text-white flex justify-between items-center">
            <span>
              {item.movie}{' '}
              <span className="text-gray-400 text-sm">(Ticket Redemption)</span>
              <span className="ml-4 text-gray-400 text-sm">{item.date}</span>
            </span>
            <span className="text-red-400 font-bold">{item.point} points</span>
          </li>
        ))}
      </ul>
    </div>
  )}
</UserDashboardLayout>
);
};

export default ScoreHistory;