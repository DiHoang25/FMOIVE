import React from 'react';
import { Select, Space } from 'antd';

const DropDown = ({ value = [], onChange }) => {
  return (
    <Space wrap>
      <Select
        mode="multiple"
        allowClear
        placeholder="Select Cinema Rooms"
        value={value}
        style={{ width: 200 }}
        onChange={onChange}
        options={[
          { value: 'Room 1', label: 'Room 1' },
          { value: 'Room 2', label: 'Room 2' },
          { value: 'Room 3', label: 'Room 3' },
          { value: 'Room 4', label: 'Room 4' },
          { value: 'Room 5', label: 'Room 5' },
        ]}
      />
    </Space>
  );
};

export default DropDown;
