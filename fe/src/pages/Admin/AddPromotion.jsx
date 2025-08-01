import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import SidebarAdmin from '../../components/Sidebar-Admin';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const AddPromotion = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    promotionCode: '',
    shortDescription: '',
    startDate: null,
    endDate: null,
    discount: '',
    rules: '',
    notes: '',
    image: '',
    imagePreview: '',
    combos: [{ title: '', items: [''], price: '' }],
    conditions: ['']
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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

  const addCombo = () => {
    setFormData({
      ...formData,
      combos: [...formData.combos, { title: '', items: [''], price: '' }]
    });
  };

  const removeCombo = (index) => {
    const updatedCombos = formData.combos.filter((_, i) => i !== index);
    setFormData({ ...formData, combos: updatedCombos });
  };

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

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, '']
    });
  };

  const removeCondition = (index) => {
    const updatedConditions = formData.conditions.filter((_, i) => i !== index);
    setFormData({ ...formData, conditions: updatedConditions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      title,
      promotionCode,
      shortDescription,
      startDate,
      endDate,
      discount,
      rules,
      notes,
      image,
      combos,
      conditions
    } = formData;

    // === VALIDATION CHECKS ===
    if (!title.trim()) return message.error("Please enter promotion title.");
    if (!promotionCode.trim()) return message.error("Please enter promotion code.");
    if (!shortDescription.trim()) return message.error("Please enter short description.");
    if (!startDate || !endDate) return message.error("Please select start and end dates.");
    if (!discount || isNaN(discount) || discount <= 0 || discount > 100) return message.error("Please enter valid discount percentage (1-100%).");
    if (dayjs(startDate).isAfter(dayjs(endDate))) return message.error("Start date cannot be after end date.");
    if (!image) return message.error("Please select promotion image.");
    
    // Validate combos
    const hasValidCombos = combos.some(combo => 
      combo.title.trim() && combo.price && combo.items.some(item => item.trim())
    );
    if (!hasValidCombos) return message.error("Please add at least one valid combo with title, price, and items.");
    
    // Validate conditions
    const hasValidConditions = conditions.some(condition => condition.trim());
    if (!hasValidConditions) return message.error("Please add at least one condition.");

    const formDataToSend = new FormData();
    formDataToSend.append('title', title);
    formDataToSend.append('promotion_code', promotionCode);
    formDataToSend.append('short_description', shortDescription);
    formDataToSend.append('start_date', startDate.toISOString());
    formDataToSend.append('end_date', endDate.toISOString());
    formDataToSend.append('discount', discount);
    formDataToSend.append('rules', rules || '');
    formDataToSend.append('notes', notes || '');
    formDataToSend.append('combos', JSON.stringify(combos));
    formDataToSend.append('conditions', JSON.stringify(conditions));

    if (image) formDataToSend.append('image', image);

    const hide = message.loading('Adding promotion...', 0);

    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/promotions', {
        method: 'POST',
        body: formDataToSend
      });

      if (!res.ok) throw new Error('Failed to create promotion');

      hide();
      setSuccess(true);
    } catch (error) {
      hide();
      console.error('Error:', error);
      message.error('Error adding promotion.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      promotionCode: '',
      shortDescription: '',
      startDate: dayjs().startOf('day'),
      endDate: dayjs().add(30, 'days').startOf('day'),
      discount: '',
      rules: '',
      notes: '',
      image: '',
      imagePreview: '',
      combos: [{ title: '', items: [''], price: '' }],
      conditions: ['']
    });
  };

  return (
    <SidebarAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Add New Promotion
              </h1>
              <p className="text-slate-300 text-sm md:text-lg">Enter details for the new promotion</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div
              className="w-full max-w-4xl mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: '20px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Promotion Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="promotionCode"
                        value={formData.promotionCode}
                        onChange={handleInputChange}
                        className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 mb-1 font-medium text-sm">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            value={formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : ''}
                            onChange={(e) => setFormData({ ...formData, startDate: dayjs(e.target.value) })}
                            min={dayjs().format('YYYY-MM-DD')}
                            className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-1 font-medium text-sm">
                            End Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : ''}
                            onChange={(e) => setFormData({ ...formData, endDate: dayjs(e.target.value) })}
                            min={dayjs().format('YYYY-MM-DD')}
                            className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                          />
                        </div>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Discount (%) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="1"
                        max="100"
                        className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Short Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="shortDescription"
                        value={formData.shortDescription}
                        onChange={handleInputChange}
                        rows="4"
                        className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      ></textarea>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Promotion Image <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        name="image"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            setFormData({
                              ...formData,
                              image: file,
                              imagePreview: URL.createObjectURL(file)
                            });
                          }
                        }}
                      />
                      <label htmlFor="image-upload" className="block cursor-pointer">
                        {formData.imagePreview ? (
                          <img
                            src={formData.imagePreview}
                            alt="Image Preview"
                            className="w-full h-32 object-contain rounded-xl border-2 border-dashed border-gray-600 hover:border-blue-500 transition-all duration-200"
                          />
                        ) : (
                          <div className="w-full h-32 border-2 border-dashed border-gray-600 flex items-center justify-center rounded-xl text-gray-400 hover:border-blue-500 transition-all duration-200">
                            Click to upload image
                          </div>
                        )}
                      </label>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Combo Packages <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-4">
                        {formData.combos.map((combo, index) => (
                          <div key={index} className="bg-slate-900/30 rounded-xl p-4 border border-slate-600/30">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-white font-medium">Combo {index + 1}</span>
                              {formData.combos.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeCombo(index)}
                                  className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded transition-colors"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            
                            <div className="space-y-3">
                              <input
                                type="text"
                                placeholder="Combo Title"
                                value={combo.title}
                                onChange={(e) => handleComboChange(index, 'title', e.target.value)}
                                className="bg-slate-700/50 text-white px-3 py-2 rounded-lg w-full border border-slate-600/50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                              />
                              
                              <input
                                type="number"
                                placeholder="Combo Price"
                                value={combo.price}
                                onChange={(e) => handleComboChange(index, 'price', e.target.value)}
                                className="bg-slate-700/50 text-white px-3 py-2 rounded-lg w-full border border-slate-600/50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                              />
                              
                              <div>
                                <label className="text-slate-300 text-sm mb-2 block">Items</label>
                                {combo.items.map((item, itemIdx) => (
                                  <div key={itemIdx} className="flex gap-2 mb-2">
                                    <input
                                      type="text"
                                      value={item}
                                      onChange={(e) => handleComboItemChange(index, itemIdx, e.target.value)}
                                      placeholder={`Item ${itemIdx + 1}`}
                                      className="bg-slate-700/50 text-white px-3 py-2 rounded-lg flex-1 border border-slate-600/50 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                    />
                                    {combo.items.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeComboItem(index, itemIdx)}
                                        className="text-red-400 hover:text-red-300 px-2 py-1 text-sm"
                                      >
                                        ×
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addComboItem(index)}
                                  className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1 rounded transition-colors"
                                >
                                  + Add Item
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addCombo}
                          className="w-full py-2 border-2 border-dashed border-slate-600/50 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all duration-200"
                        >
                          + Add New Combo
                        </button>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.8 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Conditions <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        {formData.conditions.map((condition, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={condition}
                              onChange={(e) => handleConditionChange(index, e.target.value)}
                              placeholder={`Condition ${index + 1}`}
                              className="bg-slate-900/50 text-white px-4 py-3 rounded-xl flex-1 border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                            />
                            {formData.conditions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCondition(index)}
                                className="text-red-400 hover:text-red-300 px-3 py-2 text-sm"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addCondition}
                          className="w-full py-2 border-2 border-dashed border-slate-600/50 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all duration-200"
                        >
                          + Add Condition
                        </button>
                      </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.9 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Rules
                      </label>
                      <textarea
                        name="rules"
                        value={formData.rules}
                        onChange={handleInputChange}
                        rows="4"
                        className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      ></textarea>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 1.0 }}>
                      <label className="block text-gray-300 mb-1 font-medium text-sm">
                        Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows="4"
                        className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      ></textarea>
                    </motion.div>
                  </div>

                  <motion.div
                    className="mt-8 flex flex-col sm:flex-row justify-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate('/admin/promotions')}
                      className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition duration-200 text-base font-semibold shadow-md hover:shadow-lg"
                      style={{ height: '48px' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ height: '48px', borderRadius: '12px' }}
                    >
                      {loading ? 'Creating...' : 'Submit Promotion'}
                    </button>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Success Modal */}
      <Modal
        open={success}
        onCancel={() => setSuccess(false)}
        footer={null}
        centered
        width={350}
        className="custom-ant-modal"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-800/90 backdrop-blur-lg border border-slate-600/40 p-6 rounded-xl shadow-lg w-full"
        >
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Success!</h3>
            <p className="text-gray-300 mb-6 text-sm">Promotion added successfully. Do you want to add another promotion?</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setSuccess(false);
                  resetForm();
                }}
                className="flex-1 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-semibold"
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  navigate('/admin/promotions');
                }}
                className="flex-1 px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition duration-200 text-sm font-semibold"
              >
                No
              </button>
            </div>
          </div>
        </motion.div>
      </Modal>
    </SidebarAdmin>
  );
};

export default AddPromotion;