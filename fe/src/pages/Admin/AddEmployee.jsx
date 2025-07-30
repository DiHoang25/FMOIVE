import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../../components/Sidebar-Admin"; // Assuming this path is correct
import { Modal, message, Select } from "antd"; // Import Ant Design components
import { ExclamationCircleFilled } from "@ant-design/icons"; // Import for confirm icon
import { motion } from 'framer-motion'; // Import motion for animations
import { FaSpinner } from 'react-icons/fa';


const { Option } = Select;
const { confirm } = Modal;

// Define your backend base URL for admin actions
const API_ADMIN_BASE_URL = "http://localhost:5000/api/admin/employees";

function AddEmployeePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [token, setToken] = useState("");
  const navigate = useNavigate();

  // Use React Hook Form for validation and form state
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue, // To set role value programmatically
  } = useForm({
    defaultValues: {
      gender: "male",
      role: "employee", // Default role for a new employee
      is_actived: true, // Default active status for new employee
      is_deleted: false, // Default not deleted status for new employee
    },
  });

  const password = watch("password"); // Watch password field for confirmation

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    } else {
      message.error("No authentication token found. Please log in as admin.");
      navigate("/login"); // Redirect to login if no token
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setServerError("");

    try {
      // Confirm the action before sending to API
      confirm({
        title: "Confirm Add Employee",
        icon: <ExclamationCircleFilled />,
        content: `Do you want to add new employee "${data.fullName}" with role "${data.role}"?`,
        okText: "Yes",
        cancelText: "No",
        okButtonProps: {
          style: {
            backgroundColor: "#dc2626",
            color: "white",
            borderColor: "#dc2626",
          },
        },
        onOk: async () => {
          try {
            const response = await axios.post(
              `${API_ADMIN_BASE_URL}/new_employee`,
              {
                username: data.account,
                password: data.password,
                fullname: data.fullName,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                date_of_birth: data.dateOfBirth
                  ? new Date(data.dateOfBirth).toISOString()
                  : null,
                address: data.address,
                id_card: data.idCard,
                role: data.role,
                is_deleted: false,
                is_actived: true,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            message.success(
              response.data.message || "Employee added successfully!"
            );
            console.log(
              "Employee added successfully. Attempting to reset form..."
            );
            reset(); // Reset form after successful submission
          } catch (error) {
            console.error("Error adding employee:", error);
            setServerError(
              error.response?.data?.message ||
                "Failed to add employee. Please try again."
            );
            message.error(
              error.response?.data?.message || "Failed to add employee."
            );
          } finally {
            setIsSubmitting(false);
          }
        },
        onCancel() {
          setIsSubmitting(false); // Stop submitting if canceled
        },
        className: 'custom-ant-modal', // Apply custom modal styling
      });
    } catch (error) {
      setIsSubmitting(false); // This catch handles errors from the confirm dialog itself.
    }
  };

  return (
    <SidebarLayout>
      {/* Custom Ant Design Modal styles */}
      <style>{`
          .custom-ant-modal .ant-modal-content {
              background-color: #1e293b !important; /* slate-800 */
              border-radius: 12px !important;
              border: 1px solid rgba(71, 85, 105, 0.4) !important; /* slate-600/40 */
              backdrop-filter: blur(10px) !important;
              -webkit-backdrop-filter: blur(10px) !important;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
              color: #e2e8f0 !important; /* gray-200 */
          }
          .custom-ant-modal .ant-modal-confirm-title {
              color: #e2e8f0 !important; /* gray-200 */
          }
          .custom-ant-modal .ant-modal-confirm-content {
              color: #cbd5e1 !important; /* gray-300 */
          }
          .custom-ant-modal .ant-modal-confirm-btns .ant-btn-primary {
              background-color: #dc2626 !important; /* red-600 */
              border-color: #dc2626 !important;
              color: white !important;
          }
          .custom-ant-modal .ant-modal-confirm-btns .ant-btn-default {
              background-color: #475569 !important; /* slate-600 */
              border-color: #475569 !important;
              color: white !important;
          }
          .custom-ant-modal .ant-modal-confirm-btns .ant-btn-default:hover {
              background-color: #64748b !important; /* slate-500 */
              border-color: #64748b !important;
          }
          .custom-ant-modal .ant-modal-confirm-btns .ant-btn-primary:hover {
              background-color: #b91c1c !important; /* red-700 */
              border-color: #b91c1c !important;
          }

          /* Ant Design Select dropdown options and selected text styling */
          .ant-select-selector .ant-select-selection-item {
              color: white !important; /* Ensure selected text is white */
          }

          .ant-select-selector .ant-select-selection-placeholder {
              color: rgba(255, 255, 255, 0.6) !important; /* Lighter white for placeholder */
          }

          .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option {
              color: white; /* Default text color for options */
              background-color: #1f2937; /* Dark background for options */
          }

          .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option-active {
              background-color: white !important; /* White background on hover */
              color: black !important; /* Black text on hover */
          }

          .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option-selected {
              background-color: white !important; /* White background for selected item */
              color: black !important; /* Black text for selected item */
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
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent rounded-20">
                Add New Employee
              </h1>
              <p className="text-slate-300 text-sm md:text-lg">Register a new staff member for your cinema</p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div
              className="w-full max-w-xl mx-auto px-4 py-8 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
              style={{ borderRadius: '20px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
              <div className="relative p-5 lg:p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Increased space-y */}
                  {/* Account (Username) */}
                  <div>
                    <label
                      htmlFor="account"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Account (Username)
                    </label>
                    <input
                      id="account"
                      type="text"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("account", {
                        required: "Account is required",
                        minLength: {
                          value: 3,
                          message: "Account must be at least 3 characters",
                        },
                      })}
                    />
                    {errors.account && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.account.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                    {errors.password && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("fullName", { required: "Full name is required" })}
                    />
                    {errors.fullName && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Date of Birth
                    </label>
                    <input
                      id="dateOfBirth"
                      type="date"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("dateOfBirth", {
                        required: "Date of birth is required",
                        validate: (value) => {
                          const selectedDate = new Date(value);
                          const today = new Date();
                          if (selectedDate > today) {
                            return "Date of birth cannot be in the future";
                          }
                          return true;
                        },
                      })}
                    />
                    {errors.dateOfBirth && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.dateOfBirth.message}
                      </p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Gender
                    </label>
                    <div className="flex space-x-6">
                      <label className="inline-flex items-center text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          value="male"
                          className="form-radio h-5 w-5 text-blue-500 border-gray-600 bg-slate-700 focus:ring-blue-500 transition-colors duration-200"
                          {...register("gender")}
                        />
                        <span className="ml-2 text-white">Male</span>
                      </label>
                      <label className="inline-flex items-center text-gray-300 cursor-pointer">
                        <input
                          type="radio"
                          value="female"
                          className="form-radio h-5 w-5 text-pink-500 border-gray-600 bg-slate-700 focus:ring-pink-500 transition-colors duration-200"
                          {...register("gender")}
                        />
                        <span className="ml-2 text-white">Female</span>
                      </label>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                          message: "Invalid email address",
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("phone", {
                        required: "Phone number is required",
                        pattern: {
                          value: /^[0-9]{10,11}$/,
                          message: "Enter a valid phone number (10-11 digits)",
                        },
                      })}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("address", { required: "Address is required" })}
                    />
                    {errors.address && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* ID Card */}
                  <div>
                    <label
                      htmlFor="idCard"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      ID Card
                    </label>
                    <input
                      id="idCard"
                      type="text"
                      className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      {...register("idCard", { required: "ID Card is required" })}
                    />
                    {errors.idCard && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.idCard.message}
                      </p>
                    )}
                  </div>

                  {/* Role Selection */}
                  <div>
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Role
                    </label>
                    <Select
                      id="role"
                      value={watch("role")} // Use watch to get current value
                      onChange={(value) => setValue("role", value)} // Set value with setValue
                      className="w-full bg-slate-900/50 rounded-xl text-base border border-slate-600/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                      dropdownClassName="ant-select-dropdown-dark-theme-override" // Apply custom dropdown styling
                      bordered={false} // Remove default Ant Design border
                    >
                      <Option value="employee">Employee</Option>
                      <Option value="admin">Admin</Option>
                    </Select>
                    {errors.role && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.role.message}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <p className="text-red-400 text-sm mt-2 text-center">
                      {serverError}
                    </p>
                  )}

                  {/* Buttons */}
                  <div className="flex space-x-4 mt-8"> {/* Increased margin-top */}
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="w-full py-3 px-8 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center"
                      disabled={isSubmitting}
                      style={{ height: '48px' }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] shadow-md hover:shadow-lg flex items-center justify-center"
                      style={{ height: '48px' }}
                    >
                      {isSubmitting ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" /> Adding Employee...
                        </>
                      ) : (
                        "Add Employee"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </SidebarLayout>
  );
}

export default AddEmployeePage;
