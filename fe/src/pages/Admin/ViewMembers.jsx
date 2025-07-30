import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/Sidebar-Admin';
import { Switch, Modal, message, Select, Tag } from 'antd';
import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons'; // Import LoadingOutlined
import { motion } from 'framer-motion'; // Import motion for animations
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
            // Customizing Ant Design modal style to match the dark theme
            className: 'custom-ant-modal', // Add a custom class for styling the modal itself
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
                                Account Management
                            </h1>
                        </motion.div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
                        <div
                            className="w-full max-w-full mx-auto px-4 bg-slate-800/70 backdrop-blur-lg border border-slate-600/40 shadow-2xl overflow-visible"
                            style={{ borderRadius: '20px' }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/8 via-transparent to-cyan-600/8 pointer-events-none" />
                            <div className="relative p-5 lg:p-6">
                                <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <input
                                        type="text"
                                        placeholder="Search by ID, Name, or Email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-slate-900/50 text-white px-4 py-3 rounded-xl w-full sm:w-80 border border-slate-600/50 text-base focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all duration-200"
                                    />
                                    {/* No "Add New Employee" button as per previous instructions */}
                                </div>

                                {loading ? (
                                    <div className="text-center py-8 text-gray-400 flex flex-col items-center justify-center">
                                        <LoadingOutlined style={{ fontSize: '36px', color: '#60a5fa' }} className="animate-spin mb-3" />
                                        <span className="text-lg">Loading members...</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-sm text-gray-400 mb-4">
                                            Showing {filteredMembers.length} members
                                        </div>

                                        <div className="bg-slate-900/30 rounded-xl overflow-hidden overflow-x-auto border border-slate-600/30 shadow-inner">
                                            <table className="min-w-full divide-y divide-slate-700">
                                                <thead className="bg-slate-700/50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Full Name</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">DOB</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Email</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Phone</th>
                                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-300 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-slate-800/40 divide-y divide-slate-700">
                                                    {currentMembers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={numberOfColumns} className="px-6 py-8 text-sm text-gray-400 text-center">No members found.</td>
                                                        </tr>
                                                    ) : (
                                                        currentMembers.map((member, index) => (
                                                            <tr key={member.id} className="hover:bg-slate-700/60 transition-colors duration-200">
                                                                <td className="px-6 py-4 text-sm text-gray-300">{currentPage * membersPerPage + index + 1}</td>
                                                                <td className="px-6 py-4 text-sm text-white font-medium">{member.fullName}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-300">{member.DOB}</td>
                                                                <td className="px-6 py-4 text-sm text-gray-300 break-all">{member.email}</td> {/* Added break-all */}
                                                                <td className="px-6 py-4 text-sm text-gray-300">{member.phone}</td>
                                                                <td className="px-6 py-4 text-sm">
                                                                    <Switch
                                                                        checkedChildren={<span className="text-white">Active</span>}
                                                                        unCheckedChildren={<span className="text-white">Inactive</span>}
                                                                        checked={member.status === 'Active'}
                                                                        onChange={(checked) => handleStatusChange(member.id, checked)}
                                                                        style={{
                                                                            backgroundColor: member.status === 'Active' ? '#22c55e' : '#ef4444', // Tailwind green-500 / red-500
                                                                            borderColor: member.status === 'Active' ? '#22c55e' : '#ef4444',
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
                                        <div className="mt-6 flex justify-center">
                                            <PaginationHomepage
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={setCurrentPage}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
            {/* Custom Ant Design Modal styles */}
            <style>{`
                .ant-modal-content {
                    background-color: #1e293b !important; /* slate-800 */
                    border-radius: 12px !important;
                    border: 1px solid rgba(71, 85, 105, 0.4) !important; /* slate-600/40 */
                    backdrop-filter: blur(10px) !important;
                    -webkit-backdrop-filter: blur(10px) !important;
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1) !important;
                    color: #e2e8f0 !important; /* gray-200 */
                }
                .ant-modal-confirm-title {
                    color: #e2e8f0 !important; /* gray-200 */
                }
                .ant-modal-confirm-content {
                    color: #cbd5e1 !important; /* gray-300 */
                }
                .ant-modal-confirm-btns .ant-btn-primary {
                    background-color: #dc2626 !important; /* red-600 */
                    border-color: #dc2626 !important;
                    color: white !important;
                }
                .ant-modal-confirm-btns .ant-btn-default {
                    background-color: #475569 !important; /* slate-600 */
                    border-color: #475569 !important;
                    color: white !important;
                }
                .ant-modal-confirm-btns .ant-btn-default:hover {
                    background-color: #64748b !important; /* slate-500 */
                    border-color: #64748b !important;
                }
                .ant-modal-confirm-btns .ant-btn-primary:hover {
                    background-color: #b91c1c !important; /* red-700 */
                    border-color: #b91c1c !important;
                }
            `}</style>
        </SidebarLayout>
    );
};

export default ViewMembers;
