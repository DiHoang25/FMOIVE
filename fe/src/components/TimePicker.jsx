import React from 'react';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/en';

dayjs.extend(customParseFormat);

const format = 'HH:mm';

const MultiTimePicker = ({ value = [], onChange }) => {
  const handleChange = (time) => {
    if (time) {
      const timeStr = dayjs(time).format(format);
      if (!value.includes(timeStr)) {
        onChange([...value, timeStr]);
      }
    }
  };

  const removeTime = (timeStr) => {
    onChange(value.filter((t) => t !== timeStr));
  };

  return (
    <div className="space-y-2">
      <TimePicker
        format={format}
        onChange={handleChange}
        popupClassName="custom-timepicker-popup"
      />

      <div className="flex flex-wrap gap-2">
        {value.map((t, idx) => (
          <span
            key={idx}
            className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-full text-sm"
          >
            {t}
            <button
              type="button"
              onClick={() => removeTime(t)}
              className="hover:text-gray-200 text-xs"
            >
              ✕
            </button>

          </span>
        ))}
      </div>
    </div>
  );
};

export default MultiTimePicker;
