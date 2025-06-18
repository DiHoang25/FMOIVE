import React from 'react';
import { Checkbox, Col, Row } from 'antd';

const onChange = checkedValues => {
  console.log('checked = ', checkedValues);
};

const generateTimeOptions = () => {
  const startHour = 8;
  const endHour = 22;
  const options = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    const label = `${hour}:00`;
    options.push(label);
  }

  return options;
};

const App = () => {
  const timeOptions = generateTimeOptions();

  return (
    <Checkbox.Group style={{ width: '100%' }} onChange={onChange}>
      <Row>
        {timeOptions.map((time, index) => (
          <Col span={8} key={time}>
            <Checkbox value={time} style={{ color: 'white' }}>{time}</Checkbox>

          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
};

export default App;
