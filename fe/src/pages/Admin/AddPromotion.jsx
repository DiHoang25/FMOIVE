import React, { useState } from 'react';
import {
  Form, Input, DatePicker, InputNumber, Upload, message, Button
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/Sidebar-Admin';
import dayjs from 'dayjs';

const { TextArea } = Input;

const AddPromotion = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [combos, setCombos] = useState([{ title: '', items: [''], price: null }]);
  const [conditions, setConditions] = useState(['']);

  const onUploadChange = ({ fileList }) => setFileList(fileList);

  const handleArrayChange = (setter, index, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddField = (setter) => setter(prev => [...prev, '']);
  const handleRemoveField = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

  const handleComboChange = (index, field, value) => {
    setCombos(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleComboItemChange = (comboIndex, itemIndex, value) => {
    setCombos(prev => {
      const updated = [...prev];
      updated[comboIndex].items[itemIndex] = value;
      return updated;
    });
  };

  const addCombo = () => {
    setCombos(prev => [...prev, { title: '', items: [''], price: null }]);
  };

  const removeCombo = index => {
    setCombos(prev => prev.filter((_, i) => i !== index));
  };

  const addComboItem = (comboIndex) => {
    setCombos(prev => {
      const updated = [...prev];
      updated[comboIndex].items.push('');
      return updated;
    });
  };

  const removeComboItem = (comboIndex, itemIndex) => {
    setCombos(prev => {
      const updated = [...prev];
      updated[comboIndex].items.splice(itemIndex, 1);
      return updated;
    });
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('promotion_code', values.promotion_code);
      formData.append('short_description', values.short_description);
      formData.append('start_date', values.start_date.format('YYYY-MM-DD'));
      formData.append('end_date', values.end_date.format('YYYY-MM-DD'));
      formData.append('discount', values.discount);
      formData.append('rules', values.rules || '');
      formData.append('notes', values.notes || '');
      formData.append('combos', JSON.stringify(combos));
      formData.append('conditions', JSON.stringify(conditions));

      if (fileList[0]) {
        formData.append('image', fileList[0].originFileObj);
      }

      const res = await fetch('http://localhost:5000/api/promotions', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) throw new Error('Tạo khuyến mãi thất bại');

      message.success('Promotion added successfully!');
      form.resetFields();
      setFileList([]);
      setCombos([{ title: '', items: [''], price: null }]);
      setConditions(['']);
      navigate('/admin/promotions');
    } catch (err) {
      console.error(err);
      message.error('Failed to add promotion!');
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-white font-medium";
  const inputClass = "w-full bg-white text-black font-semibold border border-slate-600 rounded";

  return (
    <SidebarAdmin>
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-900 min-h-screen py-10">
        <div className="bg-slate-800 rounded-lg p-8 max-w-3xl w-full mx-auto shadow-xl">
          <h1 className="text-2xl text-white font-bold text-center mb-6 pb-2 border-b border-slate-600">
            Add New Promotion
          </h1>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="text-white"
          >
            <Form.Item label={<label className={labelClass}>Title</label>} name="title" rules={[{ required: true }]}>
              <Input className={inputClass} />
            </Form.Item>

            <Form.Item label={<label className={labelClass}>Promotion Code</label>} name="promotion_code" rules={[{ required: true }]}>
              <Input className={inputClass} />
            </Form.Item>

            <Form.Item label={<label className={labelClass}>Short Description</label>} name="short_description" rules={[{ required: true }]}>
              <TextArea rows={2} className={inputClass} />
            </Form.Item>

            <Form.Item label={<label className={labelClass}>Start Date</label>} name="start_date" rules={[{ required: true }]}>
              <DatePicker className={inputClass} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item label={<label className={labelClass}>End Date</label>} name="end_date" rules={[{ required: true }]}>
              <DatePicker className={inputClass} format="YYYY-MM-DD" />
            </Form.Item>

            <Form.Item label={<label className={labelClass}>Discount (%)</label>} name="discount" rules={[{ required: true, type: 'number', min: 1, max: 100 }]}>
              <InputNumber className={inputClass} addonAfter="%" />
            </Form.Item>

            <Form.Item label={<label className={labelClass}>Rules</label>} name="rules">
              <TextArea rows={2} className={inputClass} />
            </Form.Item>

            <Form.Item label={<label className={labelClass}>Notes</label>} name="notes">
              <TextArea rows={2} className={inputClass} />
            </Form.Item>

            <div className="mb-6">
              <label className="text-white font-medium block mb-2">Combos</label>
              {combos.map((combo, index) => (
                <div key={index} className="border border-slate-600 p-4 rounded-lg mb-4 bg-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-white font-semibold">Combo {index + 1}</h3>
                    <Button danger onClick={() => removeCombo(index)}>Remove Combo</Button>
                  </div>

                  <Input
                    placeholder="Combo Title"
                    value={combo.title}
                    onChange={(e) => handleComboChange(index, 'title', e.target.value)}
                    className="mb-2"
                  />

                  <InputNumber
                    placeholder="Combo Price"
                    value={combo.price}
                    min={0}
                    onChange={(value) => handleComboChange(index, 'price', value)}
                    className="mb-2 w-full"
                  />

                  <div className="mt-2">
                    <label className="text-white font-medium">Items</label>
                    {combo.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex gap-2 mt-2">
                        <Input
                          value={item}
                          onChange={(e) => handleComboItemChange(index, itemIdx, e.target.value)}
                          placeholder={`Item ${itemIdx + 1}`}
                        />
                        <Button danger onClick={() => removeComboItem(index, itemIdx)}>X</Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => addComboItem(index)}
                      type="dashed"
                      icon={<PlusOutlined />}
                      className="mt-2 text-white"
                    >
                      Add Item
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={addCombo}
                type="dashed"
                icon={<PlusOutlined />}
                className="w-full text-white"
              >
                Add Combo
              </Button>
            </div>

            <div className="mb-4">
              <label className={labelClass}>Conditions</label>
              {conditions.map((cond, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={cond}
                    onChange={(e) => handleArrayChange(setConditions, index, e.target.value)}
                    className={inputClass}
                  />
                  <Button danger onClick={() => handleRemoveField(setConditions, index)}>X</Button>
                </div>
              ))}
              <Button
                type="dashed"
                onClick={() => handleAddField(setConditions)}
                className="mt-2 w-full text-white"
                icon={<PlusOutlined />}
              >
                Add Condition
              </Button>
            </div>

            <Form.Item label={<label className={labelClass}>Upload Image</label>} name="image" >
              <Upload
                className="text-white"
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
                className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded shadow hover:shadow-lg transition duration-300"
              >
                {loading ? 'Saving...' : 'Add Promotion'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </SidebarAdmin>
  );
};

export default AddPromotion;
