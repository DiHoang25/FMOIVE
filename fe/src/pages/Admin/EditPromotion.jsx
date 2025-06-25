// EditPromotion.jsx
import React, { useState, useEffect } from 'react';
import {
  Form, Input, DatePicker, InputNumber, Upload, message, Button
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarAdmin from '../../components/Sidebar-Admin';
import dayjs from 'dayjs';

const { TextArea } = Input;

const EditPromotion = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [combos, setCombos] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [editStates, setEditStates] = useState({
    title: false,
    promotion_code: false,
    short_description: false,
    start_date: false,
    end_date: false,
    discount: false,
    rules: false,
    notes: false,
    combos: false,
    conditions: false,
    image: false
  });

  const toggleEdit = (field) => {
    setEditStates(prev => ({ ...prev, [field]: !prev[field] }));
  };

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/promotions/${id}`);
        const data = await res.json();

        if (res.ok) {
          form.setFieldsValue({
            title: data.title,
            promotion_code: data.promotion_code,
            short_description: data.short_description,
            discount: data.discount,
            start_date: dayjs(data.start_date),
            end_date: dayjs(data.end_date),
            rules: data.full_details?.rules || '',
            notes: data.full_details?.notes || ''
          });

          setCombos(data.full_details?.combos || []);
          setConditions(data.full_details?.conditions || []);

          if (data.image_url) {
            setFileList([{
              uid: '-1',
              name: 'promotion.jpg',
              status: 'done',
              url: data.image_url
            }]);
          }
        } else {
          message.error(data.error || 'Lỗi khi lấy thông tin khuyến mãi');
        }
      } catch (err) {
        message.error('Lỗi server khi lấy dữ liệu');
      }
    };

    fetchPromotion();
  }, [id, form]);

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

  const addCombo = () => setCombos(prev => [...prev, { title: '', items: [''], price: null }]);
  const removeCombo = index => setCombos(prev => prev.filter((_, i) => i !== index));
  const addComboItem = comboIndex => setCombos(prev => { const updated = [...prev]; updated[comboIndex].items.push(''); return updated; });
  const removeComboItem = (comboIndex, itemIndex) => setCombos(prev => { const updated = [...prev]; updated[comboIndex].items.splice(itemIndex, 1); return updated; });

  const handleArrayChange = (setter, index, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleAddField = (setter) => setter(prev => [...prev, '']);
  const handleRemoveField = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));

  const onUploadChange = ({ fileList }) => setFileList(fileList);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('promotion_code', values.promotion_code);
      formData.append('short_description', values.short_description);
      formData.append('discount', values.discount);
      formData.append('start_date', values.start_date.format('YYYY-MM-DD'));
      formData.append('end_date', values.end_date.format('YYYY-MM-DD'));
      formData.append('rules', values.rules || '');
      formData.append('notes', values.notes || '');
      formData.append('combos', JSON.stringify(combos));
      formData.append('conditions', JSON.stringify(conditions));
      if (fileList[0] && fileList[0].originFileObj) {
        formData.append('image', fileList[0].originFileObj);
      }

      const res = await fetch(`http://localhost:5000/api/promotions/${id}`, {
        method: 'PUT',
        body: formData
      });

      const result = await res.json();
      if (res.ok) {
        message.success('Cập nhật khuyến mãi thành công!');
        navigate('/admin/promotions');
      } else {
        message.error(result.error || 'Lỗi cập nhật khuyến mãi');
      }
    } catch (err) {
      message.error('Lỗi khi gửi dữ liệu cập nhật');
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
            Edit Promotion
          </h1>

          <Form form={form} layout="vertical" onFinish={onFinish} className="text-white">

            {['title', 'promotion_code', 'short_description', 'discount', 'rules', 'notes'].map(field => (
  <Form.Item
    key={field}
    label={<label className={labelClass}>
      {field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </label>}
    name={field}
  >
    {editStates[field] ? (
      field === 'short_description' || field === 'rules' || field === 'notes' ? (
        <TextArea rows={2} className={inputClass} />
      ) : (
        <Input className={inputClass} />
      )
    ) : (
      <div className="flex justify-between items-center bg-white text-black font-medium px-3 py-2 rounded">
        <span>{form.getFieldValue(field)}</span>
        <Button onClick={() => toggleEdit(field)} type="link">Edit</Button>
      </div>
    )}
  </Form.Item>
))}


            {["start_date","end_date"].map(field => (
  <Form.Item
    key={field}
    label={
      <label className={labelClass}>
        {field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </label>
    }
    name={field}
  >
    {editStates[field] ? (
      <DatePicker className={inputClass} format="YYYY-MM-DD" />
    ) : (
      <div className="flex justify-between items-center bg-white text-black font-medium px-3 py-2 rounded">
        <span>
          {form.getFieldValue(field)?.format?.("YYYY-MM-DD") || ''}
        </span>
        <Button onClick={() => toggleEdit(field)} type="link">Edit</Button>
      </div>
    )}
  </Form.Item>
))}


            {/* Combos */}
            <div className="mb-6">
              <label className="text-white font-medium block mb-2">Combos</label>
              {!editStates.combos ? (
                <>
                  {combos.map((combo, idx) => (
                    <div key={idx} className="mb-2 bg-slate-700 p-3 rounded">
                      <div className="text-white font-semibold">Combo {idx + 1}: {combo.title} - {combo.price}đ</div>
                      <ul className="text-white ml-4 list-disc">
                        {combo.items.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  ))}
                  <Button onClick={() => toggleEdit('combos')} type="link">Edit</Button>
                </>
              ) : (
                <>
                  {combos.map((combo, index) => (
                    <div key={index} className="border border-slate-600 p-4 rounded-lg mb-4 bg-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-semibold">Combo {index + 1}</h3>
                        <Button danger onClick={() => removeCombo(index)}>Remove Combo</Button>
                      </div>
                      <Input placeholder="Combo Title" value={combo.title} onChange={(e) => handleComboChange(index, 'title', e.target.value)} className="mb-2" />
                      <InputNumber placeholder="Combo Price" value={combo.price} min={0} onChange={(value) => handleComboChange(index, 'price', value)} className="mb-2 w-full" />
                      <label className="text-white font-medium">Items</label>
                      {combo.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex gap-2 mt-2">
                          <Input value={item} onChange={(e) => handleComboItemChange(index, itemIdx, e.target.value)} />
                          <Button danger onClick={() => removeComboItem(index, itemIdx)}>X</Button>
                        </div>
                      ))}
                      <Button onClick={() => addComboItem(index)} type="dashed" icon={<PlusOutlined />} className="mt-2 text-white">Add Item</Button>
                    </div>
                  ))}
                  <Button onClick={addCombo} type="dashed" icon={<PlusOutlined />} className="w-full text-white">Add Combo</Button>
                  <Button onClick={() => toggleEdit('combos')} className="mt-2">Done</Button>
                </>
              )}
            </div>

            {/* Conditions */}
            <div className="mb-4">
              <label className={labelClass}>Conditions</label>
              {!editStates.conditions ? (
                <>
                  <ul className="text-white ml-4 list-disc">
                    {conditions.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                  <Button onClick={() => toggleEdit('conditions')} type="link">Edit</Button>
                </>
              ) : (
                <>
                  {conditions.map((cond, index) => (
                    <div key={index} className="flex gap-2 mt-2">
                      <Input value={cond} onChange={(e) => handleArrayChange(setConditions, index, e.target.value)} className={inputClass} />
                      <Button danger onClick={() => handleRemoveField(setConditions, index)}>X</Button>
                    </div>
                  ))}
                  <Button onClick={() => handleAddField(setConditions)} type="dashed" icon={<PlusOutlined />} className="w-full text-white mt-2">Add Condition</Button>
                  <Button onClick={() => toggleEdit('conditions')} className="mt-2">Done</Button>
                </>
              )}
            </div>

            {/* Image Upload */}
            <Form.Item label={<label className={labelClass}>Upload Image</label>} name="image">
              {!editStates.image ? (
                <div className="flex justify-between items-center">
                  <img src={fileList[0]?.url} alt="Promotion" className="h-24 rounded" />
                  <Button onClick={() => toggleEdit('image')} type="link">Edit</Button>
                </div>
              ) : (
                <Upload beforeUpload={() => false} fileList={fileList} onChange={onUploadChange} maxCount={1} listType="picture">
                  <button type="button" className="flex items-center px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition">
                    <UploadOutlined className="mr-2" /> Click to Upload
                  </button>
                </Upload>
              )}
            </Form.Item>

            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-4">
              <button type="button" onClick={() => navigate('/admin/promotions')} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition">Cancel</button>
              <button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded shadow hover:shadow-lg transition duration-300">
                {loading ? 'Saving...' : 'Update Promotion'}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </SidebarAdmin>
  );
};

export default EditPromotion;
