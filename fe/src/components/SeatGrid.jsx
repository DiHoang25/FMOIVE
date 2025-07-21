import React from 'react';
import { Crown } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const SeatGrid = ({
  roomData,
  movieTime,           // movieTime dạng YYYY-MM-DDTHH:mm (Asia/Ho_Chi_Minh)
  selectedSeats,
  occupiedSeats,
  onToggleSeat
}) => {
  if (!roomData) return null;

  // Lọc ghế đã bị đặt theo đúng thời gian chiếu
  const occupiedLabels = occupiedSeats?.filter(os => {
    const occupiedTimeVN = dayjs.utc(os.showtime).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DDTHH:mm");
    return occupiedTimeVN === movieTime;
  }).map(os => os.seatLabel) || [];

  const getSeatClass = (seat) => {
    const isSelected = selectedSeats.includes(seat.label);
    const isOccupied = occupiedLabels.includes(seat.label);
    const base = "w-9 h-9 text-xs sm:w-8 sm:h-8 sm:text-[10px] md:w-10 md:h-10 md:text-xs rounded-lg flex items-center justify-center font-bold transition-all duration-200 transform border-2";

    if (isOccupied) return `${base} bg-gray-600 text-white border-gray-500 cursor-not-allowed`;
    if (isSelected) return `${base} bg-gradient-to-br from-red-500 to-red-600 text-white border-red-400 shadow-lg scale-105`;
    if (seat.type === "VIP") return `${base} bg-gradient-to-br from-amber-400 to-yellow-500 text-gray-900 border-amber-300`;

    return `${base} bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 border-gray-300`;
  };

  return (
    <div className="overflow-x-auto text-center">
      <div className="inline-block space-y-3 min-w-[320px] mx-auto">
        {[...Array(roomData.rows)].map((_, rIdx) => {
          const rowLetter = String.fromCharCode(65 + rIdx);
          const rowSeats = roomData.seats.filter((s) => Number(s.row) === rIdx + 1);

          return (
            <div key={rowLetter} className="flex items-center justify-center gap-2">
              <div className="w-8 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-sm">{rowLetter}</span>
              </div>
              <div className="flex gap-2 justify-center">
                {[...Array(roomData.columns)].map((_, cIdx) => {
                  const seat = rowSeats.find((s) => Number(s.column) === cIdx + 1);
                  const isOccupied = seat && occupiedLabels.includes(seat.label);

                  return seat ? (
                    <button
                      key={seat.label}
                      onClick={() => !isOccupied && onToggleSeat(seat)}
                      className={getSeatClass(seat)}
                      disabled={isOccupied}
                      title={
                        isOccupied
                          ? `Seat ${seat.label} - Already booked`
                          : `Seat ${seat.label} - ${seat.type} - ${seat.price.toLocaleString('vi-VN')} VND`
                      }
                    >
                      {seat.type === "VIP" ? <Crown className="w-3 h-3" /> : seat.label}
                    </button>
                  ) : (
                    <div key={`empty-${cIdx}`} className="w-9 h-9 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                  );
                })}
              </div>
              <div className="w-8 flex items-center justify-center">
                <span className="text-slate-400 font-bold text-sm">{rowLetter}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SeatGrid;
