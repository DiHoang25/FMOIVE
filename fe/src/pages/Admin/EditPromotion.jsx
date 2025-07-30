// EditPromotion.jsx
import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import SidebarAdmin from '../../components/Sidebar-Admin';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const EditPromotion = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID từ URL

  const [loading, setLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    promotionCode: '',
    shortDescription: '',
    startDate: null,
    endDate: null,
    discount: '',
    rules: '',
    notes: '',
    image: null, // Dùng để lưu file mới nếu có
    imagePreview: '', // Dùng để hiển thị ảnh
    combos: [],
    conditions: []
  });
  const [editStates, setEditStates] = useState({
    title: false,
    promotionCode: false,
    shortDescription: false,
    startDate: false,
    endDate: false,
    discount: false,
    rules: false,
    notes: false,
    image: false,
    combos: false,
    conditions: false,
  });

  // Fetch dữ liệu của khuyến mãi cần sửa
  useEffect(() => {
    const fetchPromotion = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/promotions/${id}`);
        const data = await res.json();
        if (res.ok) {
          setFormData({
            title: data.title,
            promotionCode: data.promotion_code,
            shortDescription: data.short_description,
            startDate: data.start_date ? dayjs(data.start_date) : null,
            endDate: data.end_date ? dayjs(data.end_date) : null,
            discount: data.discount,
            rules: data.full_details?.rules || '',
            notes: data.full_details?.notes || '',
            image: null,
            imagePreview: data.image_url,
            combos: data.full_details?.combos || [{ title: '', items: [''], price: '' }],
            conditions: data.full_details?.conditions || [''],
          });
        } else {
          message.error(data.error || 'Failed to fetch promotion data.');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        message.error('Error fetching promotion data.');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotion();
  }, [id]);
  
  const toggleEdit = (field) => {
    setEditStates(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Các hàm xử lý input giống hệt AddPromotion
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleComboChange = (index, field, value) => {
    const updatedCombos = [...formData.combos];
    updatedCombos[index][field] = value;
    setFormData({ ...formData, combos: updatedCombos });
  };
  
  const handleComboItemChange = (comboIndex, itemIndex, value) => {
    const updatedCombos = [...formData.combos];
    updatedCombos[comboIndex].items[itemIndex] = value;
    setFormData({ ...formData, combos: updatedCombos });
  };

  const addCombo = () => setFormData({ ...formData, combos: [...formData.combos, { title: '', items: [''], price: '' }] });
  const removeCombo = (index) => setFormData({ ...formData, combos: formData.combos.filter((_, i) => i !== index) });
  const addComboItem = (comboIndex) => {
    const updatedCombos = [...formData.combos];
    updatedCombos[comboIndex].items.push('');
    setFormData({ ...formData, combos: updatedCombos });
  };
  const removeComboItem = (comboIndex, itemIndex) => {
    const updatedCombos = [...formData.combos];
    updatedCombos[comboIndex].items.splice(itemIndex, 1);
    setFormData({ ...formData, combos: updatedCombos });
  };
  const handleConditionChange = (index, value) => {
    const updatedConditions = [...formData.conditions];
    updatedConditions[index] = value;
    setFormData({ ...formData, conditions: updatedConditions });
  };
  const addCondition = () => setFormData({ ...formData, conditions: [...formData.conditions, ''] });
  const removeCondition = (index) => setFormData({ ...formData, conditions: formData.conditions.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, promotionCode, startDate, endDate, discount } = formData;
    if (!title.trim() || !promotionCode.trim() || !startDate || !endDate || !discount) {
        return message.error("Please fill all required fields.");
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('promotion_code', formData.promotionCode);
    formDataToSend.append('short_description', formData.shortDescription);
    formDataToSend.append('start_date', formData.startDate.toISOString());
    formDataToSend.append('end_date', formData.endDate.toISOString());
    formDataToSend.append('discount', formData.discount);
    formDataToSend.append('rules', formData.rules || '');
    formDataToSend.append('notes', formData.notes || '');
    formDataToSend.append('combos', JSON.stringify(formData.combos));
    formDataToSend.append('conditions', JSON.stringify(formData.conditions));
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    const hide = message.loading('Updating promotion...', 0);
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:5000/api/promotions/${id}`, {
        method: 'PUT',
        body: formDataToSend
      });
      if (!res.ok) throw new Error('Failed to update promotion');
      hide();
      setUpdateSuccess(true);
    } catch (error) {
      hide();
      console.error('Error:', error);
      message.error('Error updating promotion.');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field, label, type = 'text') => {
    const commonInputClass = "bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200";
    const displayClass = "flex justify-between items-center bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base";
    const value = formData[field];

    let content;
    if (editStates[field]) {
        switch(type) {
            case 'textarea':
                content = <textarea name={field} value={value} onChange={handleInputChange} rows="4" className={commonInputClass}></textarea>;
                break;
            case 'date':
                content = <input type="date" name={field} value={value ? dayjs(value).format('YYYY-MM-DD') : ''} onChange={(e) => setFormData({ ...formData, [field]: dayjs(e.target.value) })} className={commonInputClass} />;
                break;
            case 'number':
                content = <input type="number" name={field} value={value} onChange={handleInputChange} min="1" max="100" className={commonInputClass} />;
                break;
            default:
                content = <input type="text" name={field} value={value} onChange={handleInputChange} className={commonInputClass} />;
        }
    } else {
        let displayValue = value;
        if (type === 'date' && value) displayValue = dayjs(value).format('DD/MM/YYYY');
        if (type === 'number' && value) displayValue = `${value}%`;

        content = (
            <div className={displayClass}>
                <span>{displayValue || 'N/A'}</span>
                <button type="button" onClick={() => toggleEdit(field)} className="text-blue-400 hover:text-blue-300 ml-4">Edit</button>
            </div>
        );
    }
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
            <label className="block text-gray-300 mb-1 font-medium text-sm">{label}</label>
            {content}
        </motion.div>
    );
  };
  
  return (
    <SidebarAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Edit Promotion
              </h1>
              <p className="text-slate-300 text-sm md:text-lg">View and modify promotion details</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="w-full max-w-4xl mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible" style={{ borderRadius: '20px' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    {renderField('title', 'Title')}
                    {renderField('promotionCode', 'Promotion Code')}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderField('startDate', 'Start Date', 'date')}
                        {renderField('endDate', 'End Date', 'date')}
                    </div>
                    {renderField('discount', 'Discount (%)', 'number')}
                    {renderField('shortDescription', 'Short Description', 'textarea')}
                    
                    {/* Image Upload Section */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
                        <label className="block text-gray-300 mb-1 font-medium text-sm">Promotion Image</label>
                        <input type="file" name="image" accept="image/*" className="hidden" id="image-upload" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setFormData({ ...formData, image: file, imagePreview: URL.createObjectURL(file) });
                                setEditStates({ ...editStates, image: true });
                            }
                        }}/>
                        <label htmlFor="image-upload" className="block cursor-pointer">
                            {formData.imagePreview ? (
                                <img src={formData.imagePreview} alt="Preview" className="w-full h-32 object-contain rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all duration-200" />
                            ) : (
                                <div className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-xl text-gray-400 hover:border-blue-500 transition-all duration-200">
                                    Click to upload image
                                </div>
                            )}
                        </label>
                    </motion.div>

                    {/* Combos Section */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
                        <label className="block text-gray-300 mb-1 font-medium text-sm">Combo Packages</label>
                         {/* Combo editing UI same as AddPromotion */}
                         <div className="space-y-4">
                            {formData.combos.map((combo, index) => (
                                <div key={index} className="bg-slate-900/30 rounded-xl p-4 border border-slate-600/30">
                                    {/* ... input fields for combo ... */}
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-white font-medium">Combo {index + 1}</span>
                                        {formData.combos.length > 1 && <button type="button" onClick={() => removeCombo(index)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>}
                                    </div>
                                    <div className="space-y-3">
                                        <input type="text" placeholder="Combo Title" value={combo.title} onChange={(e) => handleComboChange(index, 'title', e.target.value)} className="bg-slate-700/50 text-white px-3 py-2 rounded-lg w-full" />
                                        <input type="number" placeholder="Combo Price" value={combo.price} onChange={(e) => handleComboChange(index, 'price', e.target.value)} className="bg-slate-700/50 text-white px-3 py-2 rounded-lg w-full" />
                                        {combo.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex gap-2">
                                                <input type="text" value={item} onChange={(e) => handleComboItemChange(index, itemIdx, e.target.value)} placeholder={`Item ${itemIdx + 1}`} className="bg-slate-700/50 text-white px-3 py-2 rounded-lg flex-1" />
                                                {combo.items.length > 1 && <button type="button" onClick={() => removeComboItem(index, itemIdx)} className="text-red-400">×</button>}
                                            </div>
                                        ))}
                                        <button type="button" onClick={() => addComboItem(index)} className="text-blue-400 hover:text-blue-300 text-sm">+ Add Item</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={addCombo} className="w-full py-2 border-2 border-dashed border-slate-600/50 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all duration-200">+ Add New Combo</button>
                        </div>
                    </motion.div>

                    {/* Conditions Section */}
                     <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.8 }}>
                        <label className="block text-gray-300 mb-1 font-medium text-sm">Conditions</label>
                         {/* Conditions editing UI same as AddPromotion */}
                         <div className="space-y-2">
                            {formData.conditions.map((condition, index) => (
                                <div key={index} className="flex gap-2">
                                    <input type="text" value={condition} onChange={(e) => handleConditionChange(index, e.target.value)} placeholder={`Condition ${index + 1}`} className="bg-slate-900/50 text-white px-4 py-3 rounded-xl flex-1" />
                                    {formData.conditions.length > 1 && <button type="button" onClick={() => removeCondition(index)} className="text-red-400 px-3">×</button>}
                                </div>
                            ))}
                            <button type="button" onClick={addCondition} className="w-full py-2 border-2 border-dashed border-slate-600/50 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all duration-200">+ Add Condition</button>
                        </div>
                    </motion.div>
                    
                    {renderField('rules', 'Rules', 'textarea')}
                    {renderField('notes', 'Notes', 'textarea')}
                  </div>
                  
                  {/* Buttons */}
                  <motion.div className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-end gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.1 }}>
                      <button type="button" onClick={() => navigate('/admin/promotions')} className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition duration-200">Cancel</button>
                      <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50" style={{ borderRadius: '12px' }}>
                          {loading ? 'Saving...' : 'Update Promotion'}
                      </button>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <Modal open={updateSuccess} onCancel={() => setUpdateSuccess(false)} footer={null} centered width={350} className="custom-ant-modal">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-6 rounded-xl shadow-lg w-full">
              <div className="text-center">
                  <div className="mb-4 flex justify-center">
                      <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Success!</h3>
                  <p className="text-gray-300 mb-6 text-sm">Promotion updated successfully.</p>
                  <div className="flex gap-4">
                      <button onClick={() => { setUpdateSuccess(false); navigate('/admin/promotions'); }} className="flex-1 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">View Promotions</button>
                      <button onClick={() => setUpdateSuccess(false)} className="flex-1 px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Continue Editing</button>
                  </div>
              </div>
          </motion.div>
      </Modal>
    </SidebarAdmin>
  );
};

export default EditPromotion;