import { useLocation } from 'react-router-dom';
import SeatSelection from '../../components/SelectSeatGrid';

function SeatSelectionPage() {
  const { state } = useLocation();

  return (
    <div className="bg-black min-h-screen text-white px-6 py-10">
      <h1 className="text-2xl font-bold text-center mb-8">SEAT DETAILS</h1>

      <div className="bg-[#1a1a1a] max-w-xl mx-auto p-6 rounded">

        {/* Seat selection UI goes here */}
        <SeatSelection/>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
