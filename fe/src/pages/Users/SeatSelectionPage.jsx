import { useLocation } from 'react-router-dom';
import SelectSeatGrid from '../../components/SelectSeatGrid';
import SeatSelection from '../../components/SelectSeatGrid';

function SeatSelectionPage() {
  const { state } = useLocation();
  const { title, poster, info, time, screen } = state || {};

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-8">SELECT YOUR SEATS</h1>

      <div className="bg-[#1a1a1a] max-w-xl mx-auto p-6 rounded">
        {/* Movie Info */}
        <div className="flex gap-4 mb-6">
          <img src={poster} alt={title} className="w-[80px] h-[120px] object-cover rounded" />
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-gray-400 text-sm">{info}</p>
            <p className="text-sm mt-2">Today, {time} <span className="text-gray-500">• {screen}</span></p>
          </div>
        </div>

        {/* Seat selection UI goes here */}
        <SeatSelection/>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
