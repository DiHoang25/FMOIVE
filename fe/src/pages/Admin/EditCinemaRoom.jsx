import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, InputNumber, Button, message } from 'antd';
import SidebarAdmin from '../../components/Sidebar-Admin';

const formatCurrency = (value) => {
  return `${value?.toLocaleString('vi-VN')} VND`;
};


const EditCinemaRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({
    roomName: '',
    rows: 0,
    columns: 0,
    roomType: '',
    normalPrice: 0,
    vipPrice: 0
  });
  const [loading, setLoading] = useState(false);
  const [editStates, setEditStates] = useState({
    normalPrice: false,
    vipPrice: false
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          setFormValues({
            roomName: data.room.roomName,
            rows: data.room.rows,
            columns: data.room.columns,
            roomType: data.room.roomType,
            normalPrice: data.room.seats.find(s => s.type === 'Normal')?.price || 0,
            vipPrice: data.room.seats.find(s => s.type === 'VIP')?.price || 0
          });
        } else {
          message.error(data.message || 'Failed to load room data.');
        }
      } catch (err) {
        message.error('Server error while fetching room data.');
      }
    };
    fetchRoom();
  }, [roomId]);

  const toggleEdit = (field) => {
    setEditStates(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/theater/rooms/${roomId}/update-prices`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          normalPrice: formValues.normalPrice,
          vipPrice: formValues.vipPrice
        })
      });

      const data = await res.json();
      if (res.ok) {
        message.success('Cập nhật giá ghế thành công.');
        navigate('/admin/cinema-rooms');
      } else {
        message.error(data.message || 'Cập nhật thất bại.');
      }
    } catch (err) {
      message.error('Lỗi máy chủ khi gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <SidebarAdmin>
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 min-h-screen py-10">
        <div className="bg-slate-800 rounded-lg p-8 max-w-3xl w-full mx-auto shadow-xl">
          <h1 className="text-2xl text-white font-bold text-center mb-6 pb-2 border-b border-slate-600">
            Edit Cinema Room
          </h1>

          <Form layout="vertical" className="text-white">
            <Form.Item label={<span className="text-white font-medium">Room Name</span>}>
              <div className="bg-white text-black px-3 py-2 rounded">{formValues.roomName}</div>
            </Form.Item>

            <Form.Item label={<span className="text-white font-medium">Room Type</span>}>
              <div className="bg-white text-black px-3 py-2 rounded">{formValues.roomType}</div>
            </Form.Item>

            <Form.Item label={<span className="text-white font-medium">Rows x Columns</span>}>
              <div className="bg-white text-black px-3 py-2 rounded">
                {formValues.rows} x {formValues.columns}
              </div>
            </Form.Item>

            <Form.Item label={<span className="text-white font-medium">Normal Seat Price</span>}>
              {editStates.normalPrice ? (
                <InputNumber
                  value={formValues.normalPrice}
                  onChange={value => setFormValues(prev => ({ ...prev, normalPrice: value }))}
                  min={0}
                  max={1000000}
                  className="w-full"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={value => value.replace(/\./g, '')}  // 👈 thêm parser xử lý dấu chấm
                />


              ) : (
                <div className="flex justify-between items-center bg-white text-black px-3 py-2 rounded">
                  <span>{formatCurrency(formValues.normalPrice)}</span>
                  <Button type="link" onClick={() => toggleEdit('normalPrice')}>Edit</Button>
                </div>
              )}
            </Form.Item>

            <Form.Item label={<span className="text-white font-medium">VIP Seat Price</span>}>
              {editStates.vipPrice ? (
                <InputNumber
                  value={formValues.vipPrice}
                  onChange={value => setFormValues(prev => ({ ...prev, vipPrice: value }))}
                  min={0}
                  max={1000000}
                  className="w-full"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={value => value.replace(/\./g, '')}
                />

              ) : (
                <div className="flex justify-between items-center bg-white text-black px-3 py-2 rounded">
                  <span>{formatCurrency(formValues.vipPrice)}</span>
                  <Button type="link" onClick={() => toggleEdit('vipPrice')}>Edit</Button>
                </div>
              )}
            </Form.Item>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/cinema-rooms')}
                className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded shadow hover:shadow-lg transition duration-300"
              >
                {loading ? 'Saving...' : 'Update Room'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </SidebarAdmin>
  );
};

export default EditCinemaRoom;