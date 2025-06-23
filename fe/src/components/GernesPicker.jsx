import React from 'react';
import { Select, Space } from 'antd';

const genreOptions = [
  { value: 'Action', label: 'Action' },
  { value: 'Drama', label: 'Drama' },
  { value: 'Romance', label: 'Romance' },
  { value: 'Thriller', label: 'Thriller' },
  { value: 'Comedy', label: 'Comedy' },
  { value: 'Horror', label: 'Horror' },
  { value: 'Sci-Fi', label: 'Sci-Fi' },
  { value: 'Animation', label: 'Animation' }
];

const GenresDropDown = ({ value = [], onChange }) => {
  return (
    <Space wrap>
      <Select
        mode="multiple"
        allowClear
        placeholder="Select Genres"
        value={value}
        style={{ width: 300 }}
        onChange={onChange}
        options={genreOptions}
      />
    </Space>
  );
};

export default GenresDropDown;
