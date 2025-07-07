import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Switch, Modal, message, Select, Tag, Button } from 'antd';
import {
    PlusOutlined,
    ExclamationCircleFilled,
    LoadingOutlined // Added for loading spinner
} from '@ant-design/icons';
import { FaTrash } from 'react-icons/fa'; // Import FaTrash
import Pagination from '../../components/PaginationHomepage';

const { Option } = Select;
const { confirm } = Modal;

// This API_BASE_URL is generally for admin-specific employee fetches/actions.
const API_BASE_URL = 'http://localhost:5000/api/admin';
const AUTH_API_BASE_URL = 'http://localhost:5000/api/auth'; // Base URL for auth-related actions

const ViewEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(''); 
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0); 
    const navigate = useNavigate();

    const employeesPerPage = 5;

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        } else {
            message.error('No authentication token found. Please log in.');
            setLoading(false);
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        if (token) {
            fetchEmployees();
        }
    }, [token]);

    useEffect(() => {
        setCurrentPage(0); 
    }, [searchTerm]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/employees`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const fetchedEmployees = (response.data.Employee || []).map(emp => ({
                ...emp,
                id: emp.userId, 
                key: emp.userId 
            }));
            setEmployees(fetchedEmployees);

        } catch (error) {
            console.error('Error fetching employees:', error);
            message.error(error.response?.data?.message || 'Failed to fetch employees. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = (employeeId, currentStatus, employeeName) => {
        const newStatusValue = !currentStatus; 

        let confirmTitle = newStatusValue ? 'Confirm Activation' : 'Confirm Deactivation';
        let confirmContent = newStatusValue ?
            `Do you want to activate employee "${employeeName}"?` :
            `Do you want to deactivate employee "${employeeName}"?`;
        let successMessage = newStatusValue ?
            `Employee "${employeeName}" activated successfully.` :
            `Employee "${employeeName}" deactivated successfully.`;
        let errorMessage = newStatusValue ?
            `Failed to activate employee "${employeeName}":` :
            `Failed to deactivate employee "${employeeName}":`;

        const apiEndpoint = `${AUTH_API_BASE_URL}/${employeeId}/status`;
        const apiBody = { status: newStatusValue.toString() }; 

        confirm({
            title: confirmTitle,
            icon: <ExclamationCircleFilled />,
            content: confirmContent,
            okText: 'Yes',
            cancelText: 'No',
            okButtonProps: {
                style: {
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderColor: '#dc2626',
                },
            },
            onOk: async () => {
                try {
                    await axios.patch( 
                        apiEndpoint,
                        apiBody,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    message.success(successMessage);
                    fetchEmployees(); 
                } catch (error) {
                    console.error('Error updating status:', error);
                    message.error(`${errorMessage} ${error.response?.data?.message || error.message}`);
                }
            },
        });
    };

    const handleUpdateRole = (employeeId, employeeName, selectedRole) => {
        const employeeToUpdate = employees.find(emp => emp.id === employeeId);
        if (employeeToUpdate && employeeToUpdate.role === selectedRole) {
            return;
        }

        if (!selectedRole) {
            message.error("Please select a role.");
            return;
        }
        confirm({
            title: 'Confirm Role Change',
            icon: <ExclamationCircleFilled />,
            content: `Do you want to change role of "${employeeName}" to "${selectedRole}"?`,
            okText: 'Yes',
            cancelText: 'No',
            okButtonProps: {
                style: {
                    backgroundColor: '#dc2626',
                    color: 'white',
                    borderColor: '#dc2626',
                },
            },
            onOk: async () => {
                try {
                    await axios.patch(
                        `${API_BASE_URL}/employees/${employeeId}/role`,
                        { role: selectedRole }, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    message.success(`Role for "${employeeName}" updated to "${selectedRole}".`);
                    fetchEmployees(); 
                } catch (error) {
                    console.error('Error updating role:', error);
                    message.error(`Failed to update role for "${employeeName}": ${error.response?.data?.message || error.message}`);
                }
            },
        });
    };

    const handleHardDelete = (employeeId, employeeName) => {
        confirm({
            title: 'Confirm Permanent Deletion',
            icon: <ExclamationCircleFilled />,
            content: `Are you sure you want to PERMANENTLY delete employee "${employeeName}"? This action cannot be undone.`,
            okText: 'Yes, Delete Permanently',
            okType: 'danger', 
            cancelText: 'No',
            okButtonProps: {
                style: {
                    backgroundColor: '#dc2626', 
                    color: 'white',
                    borderColor: '#dc2626',
                },
            },
            onOk: async () => {
                try {
                    await axios.delete(
                        `${API_BASE_URL}/employees/${employeeId}/hard_delete`, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    message.success(`Employee "${employeeName}" permanently deleted.`);
                    fetchEmployees(); 
                } catch (error) {
                    console.error('Error hard deleting employee:', error);
                    message.error(`Failed to permanently delete employee "${employeeName}": ${error.response?.data?.message || error.message}`);
                }
            },
        });
    };

    const handleAddEmployeeClick = () => {
        navigate('/admin/add-employee');
    };

    const filteredEmployees = employees.filter(employee => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

        const idMatches = employee.id?.toString().includes(lowerCaseSearchTerm) || false;
        const fullnameMatches = (employee.fullname?.trim().toLowerCase().includes(lowerCaseSearchTerm)) || false;
        const emailMatches = (employee.email?.trim().toLowerCase().includes(lowerCaseSearchTerm)) || false;
        const addressMatches = (employee.address?.trim().toLowerCase().includes(lowerCaseSearchTerm)) || false;
        const usernameMatches = (employee.username?.trim().toLowerCase().includes(lowerCaseSearchTerm)) || false;

        return idMatches || fullnameMatches || emailMatches || addressMatches || usernameMatches;
    });


    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
    // Adjust currentPage if it's out of bounds after filtering/data changes
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1); // Go to the last page if current page is now out of bounds
        } else if (totalPages === 0 && currentPage !== 0) {
            setCurrentPage(0); // If no employees, reset to page 0
        }
    }, [totalPages, currentPage]);

    const currentEmployees = filteredEmployees.slice(currentPage * employeesPerPage, (currentPage + 1) * employeesPerPage);

    // Columns: ID, Username, Full Name, Email, Phone, Role, Active, Actions (9 columns)
    const numberOfColumns = 9; 

    return (
        <SidebarLayout>
            {/* Ant Design Select dropdown options and selected text styling */}
            <style>
                {`
                /* Target the Select input text when a value is selected */
                .ant-select-selector .ant-select-selection-item {
                    color: white !important; /* Ensure selected text is white */
                }

                /* Target the placeholder text if no value is selected */
                .ant-select-selector .ant-select-selection-placeholder {
                    color: rgba(255, 255, 255, 0.6) !important; /* Lighter white for placeholder */
                }

                /* Target the dropdown overlay and options */
                .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option {
                    color: white; /* Default text color for options */
                    background-color: #1f2937; /* Dark background for options */
                }

                /* Target hover state - background white, text black */
                .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option-active {
                    background-color: white !important; /* White background on hover */
                    color: black !important; /* Black text on hover */
                }

                /* Target selected item - background white, text black */
                .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option-selected {
                    background-color: white !important; /* White background for selected item */
                    color: black !important; /* Black text for selected item */
                }
                `}
            </style>
            <div className="flex h-screen text-white">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 flex items-center justify-between shadow-md">
                        <h2 className="text-2xl text-white-500 font-bold text-center w-full">Employee Management</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-gray-700 text-white px-3 py-2 rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-red-700"
                            />
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={handleAddEmployeeClick}
                                style={{
                                    backgroundColor: '#dc2626',
                                    borderColor: '#dc2626',
                                    color: 'white',
                                }}
                                className="hover:bg-red-700"
                            >
                                Add New Employee
                            </Button>
                        </div>

                        {loading ? (
                            <div className="text-center py-4 text-gray-400">
                                <LoadingOutlined className="animate-spin mr-2 inline-block" /> Loading employees...
                            </div>
                        ) : (
                            <>
                                <div className="text-sm text-gray-400 mb-2">
                                    Showing {filteredEmployees.length} employees
                                </div>

                                {/* Removed border border-zinc-700 to match MovieList */}
                                <div className="bg-gray-800 rounded-md overflow-hidden overflow-x-auto">
                                    <table className="min-w-full divide-y divide-zinc-700">
                                        <thead className="bg-gray-900">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">ID #</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Username</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Full Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Phone</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Active</th>
                                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-300 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-zinc-700">
                                            {currentEmployees.length === 0 ? (
                                                <tr>
                                                    <td colSpan={numberOfColumns} className="px-6 py-4 text-sm text-gray-400 text-center">No employees found.</td>
                                                </tr>
                                            ) : (
                                                currentEmployees.map((employee, index) => (
                                                    <tr key={employee.key} className="hover:bg-gray-700 transition-colors duration-200">
                                                        <td className="px-6 py-4 text-sm text-gray-300">
                                                            {currentPage * employeesPerPage + index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.username}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.fullname}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.email}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.phone}</td>
                                                        
                                                        <td className="px-6 py-4 text-sm text-gray-300">
                                                            <Select
                                                                value={employee.role}
                                                                onChange={(value) => handleUpdateRole(employee.id, employee.fullname, value)}
                                                                style={{ width: 120, color: 'white' }}
                                                                className="bg-gray-700 rounded"
                                                                dropdownClassName="ant-select-dropdown-dark-theme-override"
                                                                optionLabelProp="label"
                                                                bordered={false}
                                                            >
                                                                <Option value="employee" label="Employee">Employee</Option>
                                                                <Option value="admin" label="Admin">Admin</Option>
                                                            </Select>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <Switch
                                                                checkedChildren="Active"
                                                                unCheckedChildren="Inactive"
                                                                checked={employee.is_actived}
                                                                onChange={() => handleUpdateStatus(employee.id, employee.is_actived, employee.fullname)}
                                                                style={{
                                                                    backgroundColor: employee.is_actived ? 'green' : 'red',
                                                                    borderColor: employee.is_actived ? 'green' : 'red',
                                                                }}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button 
                                                                onClick={() => handleHardDelete(employee.id, employee.fullname)} 
                                                                className="text-red-400 hover:text-red-500 text-xl"
                                                            >
                                                                <FaTrash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                                
                            </>
                        )}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default ViewEmployees;
