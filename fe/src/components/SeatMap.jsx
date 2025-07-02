import React, { useState } from "react";
import { Stage, Layer, Rect, Text, Group } from "react-konva";

const SEAT_SIZE = 40;
const PADDING = 10;

const SeatMap = ({ rows = 5, columns = 8 }) => {
  const [selectedSeats, setSelectedSeats] = useState([]);

  const toggleSeat = (row, col) => {
    const key = `${row}-${col}`;
    setSelectedSeats((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const renderSeats = () => {
    const seats = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const x = c * (SEAT_SIZE + PADDING);
        const y = r * (SEAT_SIZE + PADDING);
        const key = `${r}-${c}`;
        const isSelected = selectedSeats.includes(key);

        seats.push(
          <Group key={key} onClick={() => toggleSeat(r, c)}>
            <Rect
              x={x}
              y={y}
              width={SEAT_SIZE}
              height={SEAT_SIZE}
              cornerRadius={8}
              fill={isSelected ? "#e53e3e" : "#f7fafc"} // red or light gray
              stroke={isSelected ? "#c53030" : "#a0aec0"}
              strokeWidth={2}
              shadowBlur={isSelected ? 10 : 2}
            />
            <Text
              x={x}
              y={y}
              width={SEAT_SIZE}
              height={SEAT_SIZE}
              text={String.fromCharCode(65 + r) + (c + 1)}
              fontSize={14}
              align="center"
              verticalAlign="middle"
              fill={isSelected ? "white" : "black"}
            />
          </Group>
        );
      }
    }

    return seats;
  };

  return (
    <div className="bg-gray-900 p-4 rounded shadow">
      <Stage width={columns * 60} height={rows * 60}>
        <Layer>{renderSeats()}</Layer>
      </Stage>
    </div>
  );
};

export default SeatMap;
