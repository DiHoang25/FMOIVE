import React from 'react';
import { Select, Space } from 'antd';
const handleChange = value => {
  console.log(`selected ${value}`);
};
const App = () => (
  <Space wrap>
    <Select
      defaultValue="Select Cinema Rooms"
      style={{ width: 200 }}
      onChange={handleChange}
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
export default App;