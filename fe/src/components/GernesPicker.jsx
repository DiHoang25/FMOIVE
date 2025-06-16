import React from 'react';
import { Checkbox, Col, Row } from 'antd';

const onChange = checkedValues => {
  console.log('checked = ', checkedValues);
};

const genres = [
  'Action', 'Drama', 'Romance', 'Thriller',
  'Comedy', 'Horror', 'Sci-Fi', 'Animation'
];

const App = () => {
  return (
    <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
      <Row>
        {genres.map((genre, index) => (
          <Col span={12} key={genre}>
            <Checkbox value={genre} style={{ color: 'white' }}>
              {genre}
            </Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
};

export default App;
