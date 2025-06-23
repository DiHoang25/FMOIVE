import React from 'react';
import { TimePicker, Space, Button } from 'antd';
import dayjs from 'dayjs';

const format = 'HH:mm';

const MultiTimePicker = ({ value = [], onChange }) => {
  const [selectedTime, setSelectedTime] = React.useState(null);

  const handleAddTime = () => {
    if (!selectedTime) return;
    const formatted = selectedTime.format(format);
    if (!value.includes(formatted)) {
      onChange([...value, formatted]);
    }
    setSelectedTime(null);
  };

  const handleRemoveTime = (timeToRemove) => {
    onChange(value.filter((time) => time !== timeToRemove));
  };

  return (
    <div>
      <Space>
        <TimePicker
          format={format}
          value={selectedTime}
          onChange={(val) => setSelectedTime(val)}
        />
        <Button
          onClick={handleAddTime}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Time
        </Button>
      </Space>
      <div className="flex flex-wrap gap-2 mt-3">
        {value.map((time) => (
          <div
            key={time}
            className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
          >
            {time}
            <button
              className="ml-2 text-white hover:text-gray-300"
              onClick={() => handleRemoveTime(time)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiTimePicker;
