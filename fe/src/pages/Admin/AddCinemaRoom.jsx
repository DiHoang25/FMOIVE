import React, { useState } from "react";
import { Form, Input, InputNumber, Select, message, Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import SidebarAdmin from "../../components/Sidebar-Admin";
import { motion } from "framer-motion"; // Import motion for animations

const AddCinemaRoom = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        ...values,
        rows: Number(values.rows),
        columns: Number(values.columns),
        normalPrice: Number(values.normalPrice),
        vipPrice: Number(values.vipPrice),
      };

      const response = await fetch(
        "http://localhost:5000/api/theater/rooms/new_room",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        message.success("Phòng chiếu đã được tạo thành công!");
        form.resetFields();
        navigate("/admin/cinema-rooms");
      } else {
        message.error(data.message || "Tạo phòng thất bại!");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      message.error("Đã xảy ra lỗi khi tạo phòng.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-gray-300 mb-1 font-medium text-sm";

  // Custom Ant Design styles for inputs and selects to match the new design
  const antInputStyle = {
    backgroundColor: "rgba(15, 23, 42, 0.5)", // bg-slate-900/50
    color: "white",
    padding: "0.5rem 0.75rem", // py-2 px-3 (smaller)
    borderRadius: "0.75rem", // rounded-xl
    border: "1px solid rgba(71, 85, 105, 0.5)", // border-slate-600/50
    fontSize: "0.875rem", // text-sm (smaller)
    width: "100%",
  };

  const antSelectStyle = {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    color: "white",
    borderRadius: "0.75rem",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    fontSize: "0.875rem", // text-sm
    width: "100%",
  };

  const antSelectDropdownStyle = {
    backgroundColor: "#1e293b", // slate-800
    color: "white",
    borderRadius: "0.75rem",
  };

  return (
    <SidebarAdmin>
      <style>{`
        /* Styles for Ant Design Select component */
        .ant-select-selector {
          background-color: rgba(15, 23, 42, 0.5) !important; /* bg-slate-900/50 */
          color: white !important;
          padding: 0.5rem 0.75rem !important; /* py-2 px-3 (smaller) */
          border-radius: 0.75rem !important; /* rounded-xl */
          border: 1px solid rgba(71, 85, 105, 0.5) !important; /* border-slate-600/50 */
          font-size: 0.875rem !important; /* text-sm (smaller) */
          box-shadow: none !important;
        }

        /* Placeholder color for Ant Design Select - Changed to pure white */
        .ant-select-selection-placeholder {
            color: #FFFFFF !important; /* Pure white */
        }

        /* Select arrow color - Changed to pure white */
        .ant-select-arrow {
          color: #FFFFFF !important; /* Pure white */
        }

        .ant-select-focused .ant-select-selector,
        .ant-select-selector:focus,
        .ant-select-selector:active {
          border-color: #3b82f6 !important; /* focus:border-blue-500 */
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important; /* focus:ring-1 focus:ring-blue-500 */
          outline: none !important;
        }

        /* Styles for Ant Design Input and InputNumber components */
        .ant-input,
        .ant-input-number-input {
          background-color: rgba(15, 23, 42, 0.5) !important; /* bg-slate-900/50 */
          color: white !important;
          padding: 0.5rem 0.75rem !important; /* py-2 px-3 (smaller) */
          border-radius: 0.75rem !important; /* rounded-xl */
          border: 1px solid rgba(71, 85, 105, 0.5) !important; /* border-slate-600/50 */
          font-size: 0.875rem !important; /* text-sm (smaller) */
          transition: all 0.2s ease !important; /* transition-all duration-200 */
          height: auto !important; /* Allow height to adjust based on padding/font-size */
        }

        .ant-input-number {
          width: 100% !important;
        }

        .ant-input-number-handler-wrap {
          background-color: transparent !important;
          border-radius: 0 0.75rem 0.75rem 0 !important;
        }

        .ant-input-number-handler {
          border-left: 1px solid rgba(71, 85, 105, 0.5) !important;
          background-color: rgba(15, 23, 42, 0.5) !important;
        }

        /* Spin button colors - Changed to pure white */
        .ant-input-number-handler-up,
        .ant-input-number-handler-down {
            color: #FFFFFF !important; /* Pure white */
        }

        .ant-input-number-handler-up:hover,
        .ant-input-number-handler-down:hover {
            background-color: rgba(71, 85, 105, 0.5) !important;
            color: white !important;
        }

        /* Color for addonAfter (VND) in InputNumber - Changed to pure white */
        .ant-input-group-addon {
            background-color: rgba(15, 23, 42, 0.5) !important; /* Match input background */
            color: #FFFFFF !important; /* Pure white */
            border: 1px solid rgba(71, 85, 105, 0.5) !important; /* Match input border */
            border-left: none !important; /* Prevent double border */
            border-radius: 0 0.75rem 0.75rem 0 !important; /* Match input border radius */
            padding: 0.5rem 0.75rem !important; /* Match input padding */
            font-size: 0.875rem !important; /* Match input font size */
        }

        .ant-input:focus, .ant-input-focused,
        .ant-input-number-focused .ant-input-number-input,
        .ant-input-number:hover .ant-input-number-input,
        .ant-input-number-handler-wrap:not(.ant-input-number-handler-wrap-disabled) .ant-input-number-handler-up-active,
        .ant-input-number-handler-wrap:not(.ant-input-number-handler-wrap-disabled) .ant-input-number-handler-down-active {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
            outline: none !important;
        }

        .ant-form-item-label > label {
          color: #e2e8f0 !important;
        }
        .ant-form-item-label > label.ant-form-item-required:not(.ant-form-item-required-mark-optional)::before {
            color: #ef4444 !important;
        }

        .ant-select-dropdown {
          background-color: #1e293b !important;
          border-radius: 0.75rem !important;
          border: 1px solid rgba(71, 85, 105, 0.5) !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        .ant-select-item {
            color: #cbd5e1 !important;
        }
        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
            background-color: rgba(59, 130, 246, 0.2) !important;
            color: white !important;
        }
        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
            background-color: rgba(71, 85, 105, 0.5) !important;
            color: white !important;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Add New Cinema Room
              </h1>
              <p className="text-slate-300 text-sm md:text-lg">
                Create a new cinema room configuration
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div
              className="w-full max-w-xl mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: "20px" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  className="text-white space-y-4"
                >
                  <Form.Item
                    label={
                      <label className={labelClass}>
                        Room Name <span className="text-red-500">*</span>
                      </label>
                    }
                    name="roomName"
                    rules={[
                      { required: true, message: "Please enter room name!" },
                    ]}
                  >
                    <Input style={antInputStyle} />
                  </Form.Item>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <label className={labelClass}>
                            Number of Rows{" "}
                            <span className="text-red-500">*</span>
                          </label>
                        }
                        name="rows"
                        rules={[
                          {
                            required: true,
                            message: "Please enter number of rows!",
                          },
                          {
                            validator: (_, value) => {
                              if (value >= 1 && value <= 12)
                                return Promise.resolve();
                              return Promise.reject(
                                new Error("Rows must be between 1 and 12")
                              );
                            },
                          },
                        ]}
                      >
                        <InputNumber style={antInputStyle} min={1} max={12} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <label className={labelClass}>
                            Number of Columns{" "}
                            <span className="text-red-500">*</span>
                          </label>
                        }
                        name="columns"
                        rules={[
                          {
                            required: true,
                            message: "Please enter number of columns!",
                          },
                          {
                            validator: (_, value) => {
                              if (value >= 1 && value <= 14)
                                return Promise.resolve();
                              return Promise.reject(
                                new Error("Columns must be between 1 and 14")
                              );
                            },
                          },
                        ]}
                      >
                        <InputNumber style={antInputStyle} min={1} max={14} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label={
                      <label className={labelClass}>
                        Room Type <span className="text-red-500">*</span>
                      </label>
                    }
                    name="roomType"
                    rules={[
                      { required: true, message: "Please select room type!" },
                    ]}
                  >
                    <Select
                      style={antSelectStyle}
                      dropdownStyle={antSelectDropdownStyle}
                      options={[
                        { label: "2D", value: "2D" },
                        { label: "3D", value: "3D" },
                        { label: "IMAX", value: "IMAX" },
                      ]}
                      placeholder="Select room type"
                    />
                  </Form.Item>

                  <Row gutter={24}>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <label className={labelClass}>
                            Normal Seat Price (VND){" "}
                            <span className="text-red-500">*</span>
                          </label>
                        }
                        name="normalPrice"
                        rules={[
                          {
                            required: true,
                            type: "number",
                            min: 10000,
                            message:
                              "Please enter a valid price (min 10,000 VND)!",
                          },
                        ]}
                      >
                        <InputNumber
                          style={antInputStyle}
                          min={10000}
                          formatter={(value) =>
                            value
                              ?.toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                          }
                          parser={(value) => value.replace(/\./g, "")}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label={
                          <label className={labelClass}>
                            VIP Seat Price (VND){" "}
                            <span className="text-red-500">*</span>
                          </label>
                        }
                        name="vipPrice"
                        rules={[
                          {
                            required: true,
                            type: "number",
                            min: 10000,
                            message:
                              "Please enter a valid price (min 10,000 VND)!",
                          },
                        ]}
                      >
                        <InputNumber
                          style={antInputStyle}
                          min={10000}
                          formatter={(value) =>
                            value
                              ?.toString()
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                          }
                          parser={(value) => value.replace(/\./g, "")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <motion.div
                    className="mt-8 flex flex-col sm:flex-row justify-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    <button
                      type="button"
                      onClick={() => navigate("/admin/cinema-rooms")}
                      className="w-full sm:w-auto px-6 py-3 border border-red-500 text-red-400 rounded-xl hover:bg-red-900/20 transition duration-200 text-base font-semibold shadow-md hover:shadow-lg"
                      style={{ height: "48px" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-none text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{ height: "48px", borderRadius: "12px" }}
                    >
                      {loading ? "Adding..." : "Add Room"}
                    </button>
                  </motion.div>
                </Form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </SidebarAdmin>
  );
};

export default AddCinemaRoom;
