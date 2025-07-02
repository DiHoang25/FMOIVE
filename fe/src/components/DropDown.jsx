import React from 'react';
import { Select } from 'antd';

const DropDown = ({ value = null, onChange, options = [], disabled = false }) => {
  const handleChange = (selectedValue) => {
    const selectedRoom = options.find(room => room.value === selectedValue);
    onChange?.(selectedRoom);
  };

  return (
    <Select
      placeholder="Select Cinema Room"
      value={value?.value}
      style={{ width: 250 }}
      onChange={handleChange}
      options={options.map(opt => ({
        value: opt.value,
        label: opt.label
      }))}
      disabled={disabled} // 👈 thêm dòng này
    />
  );
};

export default DropDown;
