import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Switch, Modal, message, Select, Tag } from 'antd';
import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons'; // Import LoadingOutlined
// Assuming you have a PaginationHomepage component for consistent pagination
import PaginationHomepage from '../../components/PaginationHomepage'; 

const { Option } = Select;
const { confirm } = Modal; // This is the correct and only place to destructure confirm

// Define your backend base URL here (as per original code)
const API_BASE_URL = 'http://localhost:5000/api/admin'; // Base URL for admin-specific customer fetches/actions
const AUTH_API_BASE_URL = 'http://localhost:5000/api/auth'; // Base URL for auth-related actions (like status updates)

const ViewMembers = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0); // Start with 0 for 0-indexed pagination
    const [members, setMembers] = useState([]); // State to hold fetched members
    const [loading, setLoading] = useState(true); // Loading state

    const membersPerPage = 5;

    // State to manage member status (active/inactive)
    const [memberStatusMap, setMemberStatusMap] = useState({});

    // This useEffect handles initial data fetching
    useEffect(() => {
        fetchMembers();
    }, []); 

    // This useEffect handles resetting currentPage when searchTerm changes
    useEffect(() => {
        setCurrentPage(0); // Reset to first page on search
    }, [searchTerm]);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); // Assuming token is stored in localStorage after admin login
            if (!token) {
                message.error('Authentication token not found. Please log in as admin.');
                setLoading(false);
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/customers`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const fetchedMembers = response.data.customers.map(user => ({
                id: user.userId, // Use userId as the unique ID for frontend display and API calls
                _id: user._id, // Keep MongoDB _id for potential future use if needed
                fullName: user.fullname,
                DOB: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : 'N/A',
                email: user.email,
                phone: user.phone,
                address: user.address,
                status: user.is_actived ? 'Active' : 'Inactive',
                role: user.role, // Keep role for display if needed, but not for changing
            }));

            setMembers(fetchedMembers);

            // Initialize status map based on fetched data
            const initialStatus = {};
            fetchedMembers.forEach(member => {
                initialStatus[member.id] = member.status === 'Active';
            });
            setMemberStatusMap(initialStatus);

        } catch (error) {
            console.error('Error fetching members:', error);
            message.error(`Failed to fetch customer list: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (memberId, checked) => {
        const member = members.find(m => m.id === memberId);
        if (!member) return;

        confirm({
            title: 'Confirm Status Change',
            icon: <ExclamationCircleFilled />,
            content: `Do you want to ${checked ? 'activate' : 'deactivate'} member "${member.fullName}"?`,
            okText: 'Yes',
            cancelText: 'No',
            okType: 'primary',
            okButtonProps: {
                style: {
                    backgroundColor: '#dc2626', // Tailwind red-600
                    color: 'white',
                    borderColor: '#dc2626',
                },
            },
            onOk: async () => {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        message.error('Authentication token not found. Please log in as admin.');
                        return;
                    }

                    await axios.patch(
                        `${AUTH_API_BASE_URL}/${member.id}/status`, // Use member.id which is userId
                        { status: checked.toString() }, // Backend expects status as string 'true' or 'false'
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    // Update local state only after successful API call
                    setMemberStatusMap(prevStatus => ({
                        ...prevStatus,
                        [memberId]: checked,
                    }));
                    message.success(`Member "${member.fullName}" is now ${checked ? 'active' : 'inactive'}.`);
                } catch (error) {
                    console.error('Error changing member status:', error);
                    message.error(`Failed to update status for "${member.fullName}": ${error.response?.data?.message || error.message}`);
                }
            },
        });
    };

    const membersToDisplay = members.map(member => ({
        ...member,
        status: memberStatusMap[member.id] ? 'Active' : 'Inactive',
    }));

    const filteredMembers = membersToDisplay.filter(member => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

        const idMatches = member.id?.toString().includes(lowerCaseSearchTerm) || false;
        const fullNameMatches = (member.fullName?.trim().toLowerCase().includes(lowerCaseSearchTerm)) || false;
        const emailMatches = (member.email?.trim().toLowerCase().includes(lowerCaseSearchTerm)) || false;
        
        return idMatches || fullNameMatches || emailMatches;
    });

    const totalPages = Math.ceil(filteredMembers.length / membersPerPage);
    // Adjust currentPage if it's out of bounds after filtering/data changes
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(totalPages - 1); // Go to the last page if current page is now out of bounds
        } else if (totalPages === 0 && currentPage !== 0) {
            setCurrentPage(0); // If no members, reset to page 0
        }
    }, [totalPages, currentPage]);

    const currentMembers = filteredMembers.slice(currentPage * membersPerPage, (currentPage + 1) * membersPerPage);

    // Columns: ID, Full Name, DOB, Email, Phone, Status (6 columns)
    const numberOfColumns = 6; 

    return (
        <SidebarLayout>
            <div className="flex h-screen text-white">
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 flex items-center justify-between shadow-md">
                        <h2 className="text-2xl text-white-500 font-bold text-center w-full">Account Management</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-gray-700 text-white px-3 py-2 rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-red-700" // Matched MovieList search input
                            />
                            {/* The "Add New Employee" button was removed as per your comments */}
                        </div>

                        {loading ? (
                            <div className="text-center py-4 text-gray-400"> {/* Matched MovieList loading text */}
                                <LoadingOutlined className="animate-spin mr-2 inline-block" /> Loading members... {/* Added Ant Design LoadingOutlined */}
                            </div>
                        ) : (
                            <>
                                <div className="text-sm text-gray-400 mb-2"> {/* Matched MovieList count text */}
                                    Showing {filteredMembers.length} members
                                </div>

                                {/* Table container with styling matched to MovieList, removed border */}
                                <div className="bg-gray-800 rounded-md overflow-hidden overflow-x-auto"> {/* Removed border border-zinc-700 */}
                                    <table className="min-w-full divide-y divide-zinc-700">
                                        <thead className="bg-gray-900"> {/* Darker header background */}
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">ID #</th> {/* Bolder text */}
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Full Name</th> {/* Bolder text */}
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">DOB</th> {/* Bolder text */}
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Email</th> {/* Bolder text */}
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Phone</th> {/* Bolder text */}
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase">Status</th> {/* Bolder text */}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-gray-800 divide-y divide-zinc-700"> {/* Matched MovieList tbody background and dividers */}
                                            {currentMembers.length === 0 ? (
                                                <tr>
                                                    <td colSpan={numberOfColumns} className="px-6 py-4 text-sm text-gray-400 text-center">No members found.</td> {/* Matched MovieList no data text */}
                                                </tr>
                                            ) : (
                                                currentMembers.map((member, index) => (
                                                    <tr key={member.id} className="hover:bg-gray-700 transition-colors duration-200"> {/* Matched MovieList row hover */}
                                                        <td className="px-6 py-4 text-sm text-gray-300"> {/* Matched MovieList td styles */}
                                                            {currentPage * membersPerPage + index + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{member.fullName}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{member.DOB}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{member.email}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-300">{member.phone}</td>
                                                        
                                                        <td className="px-6 py-4">
                                                            <Switch
                                                                checkedChildren="Active"
                                                                unCheckedChildren="Inactive"
                                                                checked={member.status === 'Active'}
                                                                onChange={(checked) => handleStatusChange(member.id, checked)}
                                                                style={{
                                                                    backgroundColor: member.status === 'Active' ? 'green' : 'red',
                                                                    borderColor: member.status === 'Active' ? 'green' : 'red',
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination Component */}
                                <PaginationHomepage
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

export default ViewMembers;
