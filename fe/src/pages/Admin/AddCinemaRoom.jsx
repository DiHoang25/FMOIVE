import React, { useState } from 'react';
import { Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/Sidebar-Admin';

const AddCinemaRoom = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = (values) => {
        setLoading(true);
        console.log('Submitted values:', values);
        message.success('Cinema room added successfully!');
        form.resetFields();
        setLoading(false);
    };

    return (
        <SidebarAdmin>
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 min-h-screen py-10">
                <div className="bg-slate-800 rounded-lg p-8 max-w-3xl w-full mx-auto shadow-xl">

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
                            label={<span className="text-gray-300">Cinema Room ID</span>}
                            name="cinemaRoomId"
                            rules={[{ required: true, message: 'Please input cinema room ID!' }]}
                        >
                            <Input
                                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 
                                focus:bg-slate-700 focus:text-white focus:border-blue-500 
                                hover:bg-slate-700 focus:outline-none"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-gray-300">Cinema Room Name</span>}
                            name="cinemaRoomName"
                            rules={[{ required: true, message: 'Please input cinema room name!' }]}
                        >
                            <Input
                                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 
                                focus:bg-slate-700 focus:text-white focus:border-blue-500 
                                hover:bg-slate-700 focus:outline-none"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="text-gray-300">Seat Quantity</span>}
                            name="seatQuantity"
                            rules={[
                                { required: true, message: 'Please input seat quantity!' },
                                { pattern: /^[1-9]\d*$/, message: 'Please input a valid number!' },
                            ]}
                        >
                            <Input
                                type="number"
                                min="1"
                                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600 
                                focus:bg-slate-700 focus:text-white focus:border-blue-500 
                                hover:bg-slate-700 focus:outline-none"
                            />
                        </Form.Item>

                        <div className="mt-6 flex justify-end space-x-4">
                            {/* Nút Cancel */}
                            <button
                                type="button"
                                onClick={() => navigate('/admin/cinema-rooms')}
                                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded shadow hover:shadow-lg transition duration-300"
                            >
                                Add Cinema Room
                            </button>
                        </div>
                    </Form>
                </div>
            </div>
        </SidebarAdmin>
    );
};

export default AddCinemaRoom;
