import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, message, Row, Col } from 'antd';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/Sidebar-Admin';

const AddCinemaRoom = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/theater/rooms/new_room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Phòng chiếu đã được tạo thành công!');
        form.resetFields();
        navigate('/admin/cinema-rooms');
      } else {
        message.error(data.message || 'Tạo phòng thất bại!');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      message.error('Đã xảy ra lỗi khi tạo phòng.');
    } finally {
      setLoading(false);
    }
  };

  const labelClass = 'text-white font-medium';
  const inputClass = 'w-full bg-white text-black font-semibold border border-slate-600 rounded';

  return (
    <SidebarAdmin>
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 min-h-screen py-10">
        <div className="bg-slate-800 rounded-lg p-8 max-w-xl w-full mx-auto shadow-xl">
          <h1 className="text-2xl text-white font-bold text-center mb-6 pb-2 border-b border-slate-600">
            Add New Cinema Room
          </h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="text-white"
          >
            <Form.Item
              label={<label className={labelClass}>Room Name</label>}
              name="roomName"
              rules={[{ required: true, message: 'Please enter room name!' }]}
            >
              <Input className={inputClass} />
            </Form.Item>

            <Form.Item
              label={<label className={labelClass}>Number of Rows</label>}
              name="rows"
              rules={[{ required: true, type: 'number', min: 1, max: 50 }]}
            >
              <InputNumber min={1} max={50} className={inputClass} />
            </Form.Item>

            <Form.Item
              label={<label className={labelClass}>Number of Columns</label>}
              name="columns"
              rules={[{ required: true, type: 'number', min: 1, max: 50 }]}
            >
              <InputNumber min={1} max={50} className={inputClass} />
            </Form.Item>

            <Form.Item
              label={<label className={labelClass}>Room Type</label>}
              name="roomType"
              rules={[{ required: true, message: 'Please select room type!' }]}
            >
              <Select
                className="bg-white text-black font-semibold rounded"
                options={[
                  { label: '2D', value: '2D' },
                  { label: '3D', value: '3D' },
                  { label: 'IMAX', value: 'imax' },
                ]}
                placeholder="Select room type"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<label className={labelClass}>Normal Seat Price (VND)</label>}
                  name="normalPrice"
                  rules={[{ required: true, type: 'number', min: 10000 }]}
                >
                  <InputNumber
                    min={10000}
                    className={inputClass}
                    formatter={(value) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => value.replace(/\./g, '')}
                    addonAfter="VND"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<label className={labelClass}>VIP Seat Price (VND)</label>}
                  name="vipPrice"
                  rules={[{ required: true, type: 'number', min: 10000 }]}
                >
                  <InputNumber
                    min={10000}
                    className={inputClass}
                    formatter={(value) => value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={(value) => value.replace(/\./g, '')}
                    addonAfter="VND"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/cinema-rooms')}
                className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded shadow hover:shadow-lg transition duration-300"
              >
                {loading ? 'Saving...' : 'Add Room'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </SidebarAdmin>
  );
};

export default AddCinemaRoom;
