import React, { useState } from 'react';
import { Form, Input, DatePicker, InputNumber, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/Sidebar-Admin';


const { TextArea } = Input;

const EditPromotion = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  const onFinish = (values) => {
    setLoading(true);

    const formattedValues = {
      ...values,
      startTime: values.startTime?.format('YYYY-MM-DD'),
      endTime: values.endTime?.format('YYYY-MM-DD'),
      image: fileList.length > 0 ? fileList[0].originFileObj.name : '',
    };

    console.log('Submitted values:', formattedValues);
    message.success('Promotion added successfully!');
    form.resetFields();
    setFileList([]);
    setLoading(false);
  };

  const onUploadChange = ({ fileList }) => setFileList(fileList);

  return (
    <SidebarAdmin>
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 min-h-screen py-10">
        <div className="bg-slate-800 rounded-lg p-8 max-w-3xl w-full mx-auto shadow-xl">
          <h1 className="text-2xl text-white font-bold text-center mb-6 pb-2 border-b border-slate-600">
            Edit Promotion
          </h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="text-white"
          >
            <Form.Item
              label={<span className="text-gray-300">Title</span>}
              name="title"
              rules={[{ required: true, message: 'Please input the promotion title!' }]}
            >
              <Input
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600
                focus:bg-slate-700 focus:text-white focus:border-blue-500
                hover:bg-slate-700 focus:outline-none"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Start Time</span>}
              name="startTime"
              rules={[{ required: true, message: 'Please select start time!' }]}
            >
              <DatePicker
                className="w-full p-3 rounded-lg bg-white-700 text-black border border-slate-600"
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">End Time</span>}
              name="endTime"
              rules={[{ required: true, message: 'Please select end time!' }]}
            >
              <DatePicker
                className="w-full p-3 rounded-lg bg-white-700 text-black border border-slate-600"
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Discount Level (%)</span>}
              name="discountLevel"
              rules={[
                { required: true, message: 'Please input discount level!' },
                { type: 'number', min: 1, max: 100, message: 'Discount must be between 1 and 100%' },
              ]}
            >
              <InputNumber
                className="w-full p-3 rounded-lg bg-slate-700 text-white border border-slate-600"
                min={1}
                max={100}
                addonAfter={<span className="text-white">%</span>}
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Detail</span>}
              name="detail"
              rules={[{ required: true, message: 'Please enter promotion detail!' }]}
            >
              <TextArea
                rows={4}
                className="w-full rounded-lg bg-slate-700 text-white border border-slate-600
                focus:bg-slate-700 focus:text-white focus:border-blue-500
                hover:bg-slate-700 focus:outline-none"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-gray-300">Upload Image</span>}
              name="image"
              valuePropName="fileList"
            >
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={onUploadChange}
                maxCount={1}
              >
                <button
                  type="button"
                  className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
                >
                  <UploadOutlined className="mr-2" />
                  Click to Upload
                </button>
              </Upload>
            </Form.Item>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/admin/promotions')}
                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded shadow hover:shadow-lg transition duration-300"
              >
                Add Promotion
              </button>
            </div>
          </Form>
        </div>
      </div>
    </SidebarAdmin>
  );
};

export default EditPromotion;
