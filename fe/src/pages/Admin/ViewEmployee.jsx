import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Switch, Modal, message, Select, Tag, Button } from 'antd';
import {
    PlusOutlined,
    ExclamationCircleFilled
} from '@ant-design/icons';
import Pagination from '../../components/PaginationHomepage';

const { Option } = Select;
const { confirm } = Modal;

// This API_BASE_URL is generally for admin-specific employee fetches/actions.
const API_BASE_URL = 'http://localhost:5000/api/admin';
const AUTH_API_BASE_URL = 'http://localhost:5000/api/auth'; // Base URL for auth-related actions

const ViewEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    // Declare token state here
    const [token, setToken] = useState(''); 
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0); 
    const navigate = useNavigate();

    const employeesPerPage = 5;

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            // Use setToken to update the state
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

    // Add this useEffect to reset currentPage to 0 when searchTerm changes
    useEffect(() => {
        setCurrentPage(0); 
    }, [searchTerm]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            // This fetch still uses the admin API base URL for getting employee list
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

    // Modified handleUpdateStatus to only change the active status (true/false)
    const handleUpdateStatus = (employeeId, currentStatus, employeeName) => {
        const newStatusValue = !currentStatus; // What the status *will be* if confirmed

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

        // Always point to the AUTH_API_BASE_URL for status updates
        const apiEndpoint = `${AUTH_API_BASE_URL}/${employeeId}/status`;
        const apiBody = { status: newStatusValue.toString() }; // Send as string 'true' or 'false'

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
                    await axios.patch( // Use patch for partial update (status)
                        apiEndpoint,
                        apiBody,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    message.success(successMessage);
                    fetchEmployees(); // Refresh the list to reflect changes
                } catch (error) {
                    console.error('Error updating status:', error);
                    message.error(`${errorMessage} ${error.response?.data?.message || error.message}`);
                }
            },
        });
    };

    // Modified handleUpdateRole to use selectedRole directly
    const handleUpdateRole = (employeeId, employeeName, selectedRole) => {
        // Only trigger update if the role actually changed
        const employeeToUpdate = employees.find(emp => emp.id === employeeId);
        if (employeeToUpdate && employeeToUpdate.role === selectedRole) {
            // Role is the same, no action needed.
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
                    // This role update endpoint is still assumed to be under the admin base URL
                    await axios.patch(
                        `${API_BASE_URL}/employees/${employeeId}/role`,
                        { newRole: selectedRole },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    message.success(`Role for "${employeeName}" updated to "${selectedRole}".`);
                    fetchEmployees(); // Refresh the list
                } catch (error) {
                    console.error('Error updating role:', error);
                    message.error(`Failed to update role for "${employeeName}": ${error.response?.data?.message || error.message}`);
                }
            },
        });
    };

    const handleAddEmployeeClick = () => {
        navigate('/admin/add-employee');
    };

    // Corrected filteredEmployees logic to handle potential undefined properties
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
    const currentEmployees = filteredEmployees.slice(currentPage * employeesPerPage, (currentPage + 1) * employeesPerPage);

    // Columns: ID, Username, Full Name, Email, Phone, Address, Role, Active (8 columns)
    const numberOfColumns = 8;

    return (
        <SidebarLayout>
            {/* Added style block for custom Ant Design Select dropdown options and selected text */}
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

                /* Target hover state */
                .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option-active {
                    background-color: #374151; /* Darker background on hover */
                }

                /* Target selected item */
                .ant-select-dropdown.ant-select-dropdown-dark-theme-override .ant-select-item-option-selected {
                    background-color: #dc2626; /* Red background for selected item */
                    color: white; /* White text for selected item */
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
                                className="bg-gray-800 text-gray-300 pl-4 pr-10 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-red-700 w-64"
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
                            <div className="text-center text-gray-400">Loading employees...</div>
                        ) : (
                            <>
                                <div className="text-sm text-gray-400 mb-2">
                                    Showing {filteredEmployees.length} employees
                                </div>

                                <div className="bg-gray-800 rounded-md overflow-hidden border border-zinc-700 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-zinc-700">
                                        <thead>
                                            <tr className="bg-gray-800">
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID #</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Username</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Full Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Phone</th>
                                              
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Active</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-zinc-700">
                                            {currentEmployees.length === 0 ? (
                                                <tr>
                                                    <td colSpan={numberOfColumns} className="px-6 py-4 text-sm text-gray-300 text-center">No employees found.</td>
                                                </tr>
                                            ) : (
                                                currentEmployees.map((employee, index) => (
                                                    <tr key={employee.key} className="hover:bg-gray-700 transition-colors duration-200">
                                                        {/* Display sequential ID, adjusted for 0-indexed currentPage */}
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