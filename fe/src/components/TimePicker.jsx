import React from 'react';
import { Checkbox, Col, Row } from 'antd';

const generateTimeOptions = () => {
  const startHour = 8;
  const endHour = 22;
  const options = [];

  for (let hour = startHour; hour <= endHour; hour++) {
    const label = `${hour.toString().padStart(2, '0')}:00`;
    options.push(label);
  }

  return options;
};

const TimePicker = ({ value = [], onChange }) => {
  const timeOptions = generateTimeOptions();

  return (
    <Checkbox.Group style={{ width: '100%' }} value={value} onChange={onChange}>
      <Row>
        {timeOptions.map((time) => (
          <Col span={8} key={time}>
            <Checkbox value={time} style={{ color: 'white' }}>
              {time}
            </Checkbox>
          </Col>
        ))}
      </Row>
    </Checkbox.Group>
  );
};

export default TimePicker;
