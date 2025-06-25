import React from 'react';
import { DatePicker as AntdDatePicker } from 'antd';

const DatePicker = ({ value, onChange, ...rest }) => {
  return (
    <AntdDatePicker
      value={value} // phải là dayjs hoặc null
      onChange={onChange}
      format="YYYY-MM-DD"
      className="w-full"
      {...rest}
    />
  );
};

export default DatePicker;
