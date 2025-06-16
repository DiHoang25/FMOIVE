import React from 'react';
import { Space, Switch } from 'antd';
const App = () => (
  <Space direction="vertical">
    <Switch checkedChildren="Active" unCheckedChildren="Inactive" defaultChecked />
  </Space>
);
export default App;