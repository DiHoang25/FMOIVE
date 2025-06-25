import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Switch, Modal, message, Select, Tag, Button } from 'antd';
import {
    PlusOutlined,
    ExclamationCircleFilled
} from '@ant-design/icons';

const { Option } = Select;
const { confirm } = Modal;

const API_BASE_URL = 'http://localhost:5000/api/admin';

const ViewEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState('');
    // Removed editingUserId and newRole states as they are no longer needed for streamlined role change
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
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
            message.success('Fetched employees successfully!');
        } catch (error) {
            console.error('Error fetching employees:', error);
            message.error(error.response?.data?.message || 'Failed to fetch employees. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Modified handleUpdateStatus to align with backend soft delete logic
    const handleUpdateStatus = (employeeId, currentStatus, employeeName, isDeleted) => {
        const newStatusValue = !currentStatus; // What the status *will be* if confirmed

        let confirmTitle = 'Confirm Status Change';
        let confirmContent = '';
        let successMessage = '';
        let errorMessage = '';
        let apiEndpoint = '';
        let apiBody = {};
        let httpMethod = 'patch';

        if (newStatusValue === false) { // User wants to deactivate (which now triggers soft delete)
            if (isDeleted) {
                message.warn(`Employee "${employeeName}" is already soft-deleted and inactive.`);
                // No action needed if already deleted. Fetch employees to ensure UI reflects backend if out of sync.
                fetchEmployees();
                return;
            }
            // If currently active and user wants to deactivate, perform soft delete
            confirmTitle = 'Confirm Soft Delete';
            confirmContent = `Do you want to soft delete employee "${employeeName}"? This will also deactivate their account.`;
            successMessage = `Employee "${employeeName}" soft deleted successfully.`;
            errorMessage = `Failed to soft delete employee "${employeeName}":`;
            apiEndpoint = `${API_BASE_URL}/employees/${employeeId}/delete`; // Backend soft delete endpoint
            apiBody = {}; // Body for soft delete is usually empty
        } else { // User wants to activate
            if (isDeleted) {
                message.error('Cannot activate a soft-deleted employee. An "undelete" action would be required first.');
                // No action needed if deleted. Fetch employees to ensure UI reflects backend if out of sync.
                fetchEmployees();
                return;
            }
            confirmTitle = 'Confirm Activation';
            confirmContent = `Do you want to activate employee "${employeeName}"?`;
            successMessage = `Employee "${employeeName}" is now active.`;
            errorMessage = `Failed to activate employee "${employeeName}":`;
            apiEndpoint = `${API_BASE_URL}/employees/${employeeId}/status`; // Backend activation endpoint
            apiBody = { status: newStatusValue.toString() };
        }

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
                    await axios[httpMethod](
                        apiEndpoint,
                        apiBody,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    message.success(successMessage);
                    fetchEmployees(); // Refresh the list to reflect changes
                } catch (error) {
                    console.error('Error updating status/deleting:', error);
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
                    await axios.patch(
                        `${API_BASE_URL}/employees/${employeeId}/role`,
                        { role: selectedRole },
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

    const filteredEmployees = employees.filter(employee =>
        employee.id.toString().includes(searchTerm) ||
        employee.fullname.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        employee.email.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        employee.address.trim().toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        employee.username.trim().toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
    const currentEmployees = filteredEmployees.slice((currentPage - 1) * employeesPerPage, currentPage * employeesPerPage);

    // Columns: ID, Username, Full Name, Email, Phone, Address, Role, Active (8 columns)
    const numberOfColumns = 8;

    return (
        <SidebarLayout>
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
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Address</th>
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
                                                currentEmployees.map(employee => (
                                                    <tr key={employee.key} className="hover:bg-gray-700 transition-colors duration-200">
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.id}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.username}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.fullname}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.email}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.phone}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{employee.address}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">
                                                            <Select
                                                                value={employee.role}
                                                                onChange={(value) => handleUpdateRole(employee.id, employee.fullname, value)}
                                                                style={{ width: 120 }}
                                                                className="bg-gray-700 text-white rounded"
                                                                dropdownStyle={{ backgroundColor: '#1f2937' }}
                                                                optionLabelProp="label"
                                                                disabled={employee.is_deleted} // Disable if soft deleted
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
                                                                onChange={() => handleUpdateStatus(employee.id, employee.is_actived, employee.fullname, employee.is_deleted)}
                                                                disabled={employee.is_deleted} // Disable if soft deleted
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

                                <div className="flex justify-center items-center space-x-2 mt-4">
                                    <button
                                        className="p-2 rounded-md text-red-500 hover:bg-zinc-800"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            className={`w-8 h-8 rounded-md flex items-center justify-center ${
                                                currentPage === page ? 'bg-red-600 text-white' : 'text-gray-400 hover:bg-zinc-800'
                                            }`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        className="p-2 rounded-md text-red-500 hover:bg-zinc-800"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
};

export default ViewEmployees;