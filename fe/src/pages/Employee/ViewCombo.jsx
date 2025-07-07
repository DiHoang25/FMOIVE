import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { Modal, message, Tag } from 'antd';
import Pagination from '../../components/PaginationHomepage';
import SidebarLayout from '../../components/Sidebar-Employee';
import dayjs from 'dayjs';
import axios from 'axios';

const ViewCombo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const formatVND = (value) => {
  if (typeof value !== 'number') return '';
  return `${value.toLocaleString('vi-VN')}₫`;
};


  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/combo', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCombos(response.data.combos);
      } catch (error) {
        console.error('Error fetching combos:', error);
        message.error(`Failed to fetch combos: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, combos]);

  const getComboStatus = (combo) => {
    const today = dayjs();
    const start = dayjs(combo.startDate);
    const end = dayjs(combo.endDate);
    if (!combo.isActive) return 'inactive';
    if (today.isBefore(start)) return 'upcoming';
    if (today.isAfter(end)) return 'expired';
    return 'active';
  };

  const totalCombos = combos.length;
  const activeCombos = combos.filter(combo => getComboStatus(combo) === 'active').length;
  const upcomingCombos = combos.filter(combo => getComboStatus(combo) === 'upcoming').length;
  const expiredCombos = combos.filter(combo => getComboStatus(combo) === 'expired').length;

  const confirmDelete = async (combo) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete "${combo.comboName}"?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.delete(`http://localhost:5000/api/combo/${combo._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const updated = combos.filter(c => c._id !== combo._id);
          setCombos(updated);
          message.success(`\"${combo.comboName}\" đã được xóa thành công.`);
        } catch (error) {
          console.error('Error deleting combo:', error);
          message.error(`Failed to delete \"${combo.comboName}\": ${error.message}`);
        }
      },
    });
  };

  const showComboDetails = (combo) => {
    setSelectedCombo(combo);
    setModalVisible(true);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredCombos = combos.filter(combo =>
    combo.comboName?.trim().toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const totalPages = Math.ceil(filteredCombos.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const paginatedCombos = filteredCombos.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = page => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  const formatStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'upcoming': return 'Upcoming';
      case 'expired': return 'Expired';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Combo Management</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-300">Total Combos</p>
            <h2 className="text-xl font-bold">{totalCombos}</h2>
          </div>
          <div className="bg-green-700 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-100">Active</p>
            <h2 className="text-xl font-bold">{activeCombos}</h2>
          </div>
          <div className="bg-yellow-600 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-100">Upcoming</p>
            <h2 className="text-xl font-bold">{upcomingCombos}</h2>
          </div>
          <div className="bg-blue-600 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-100">Expired</p>
            <h2 className="text-xl font-bold">{expiredCombos}</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search combo..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-700 text-white px-3 py-2 rounded-md w-64"
          />
          <Link to="/employee/add-combo" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            + Add New Combo
          </Link>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Items Count</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    <FaSpinner className="animate-spin mr-2" /> Loading combos...
                  </td>
                </tr>
              ) : paginatedCombos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">No combos found.</td>
                </tr>
              ) : (
                paginatedCombos.map((combo, index) => {
                  const status = getComboStatus(combo);
                  return (
                    <tr key={combo._id} className="hover:bg-gray-700 transition">
                      <td className="px-4 py-2">{(currentPage * itemsPerPage + index + 1)}</td>
                      <td className="px-4 py-2">{combo.comboName}</td>
                      <td className="px-4 py-2">{formatVND(combo.price)}</td>
                      <td className="px-4 py-2">{combo.items.length}</td>
                      <td className="px-4 py-2">
                        {status === 'active' && <Tag color="green">Active</Tag>}
                        {status === 'upcoming' && <Tag color="orange">Upcoming</Tag>}
                        {status === 'expired' && <Tag color="red">Expired</Tag>}
                        {status === 'inactive' && <Tag color="default">Inactive</Tag>}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <div className="flex justify-center gap-4">
                          <button onClick={() => showComboDetails(combo)} className="text-blue-400 hover:text-blue-600 text-xl"><FaEye /></button>
                          <button onClick={() => window.location.href = '/employee/view-combo/edit-combo/' + combo._id} className="text-yellow-400 hover:text-yellow-600 text-xl"><FaEdit /></button>
                          <button onClick={() => confirmDelete(combo)} className="text-red-400 hover:text-red-600 text-xl"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {totalPages > 0 && (
            <div className="py-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>

        <Modal
          title="Combo Details"
          open={modalVisible}
          onOk={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
          width={700}
          bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
          footer={[
            <button key="close" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md" onClick={() => setModalVisible(false)}>
              Close
            </button>,
          ]}
        >
          {selectedCombo && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-black">
                <div><p className="text-gray-400">Combo Name:</p><p>{selectedCombo.comboName}</p></div>
                <div><p className="text-gray-400">Price:</p><p>{formatVND(selectedCombo.price)}</p></div>
                <div><p className="text-gray-400">Description:</p><p>{selectedCombo.description}</p></div>
                <div><p className="text-gray-400">Start Date:</p><p>{dayjs(selectedCombo.startDate).format('DD/MM/YYYY')}</p></div>
                <div><p className="text-gray-400">End Date:</p><p>{dayjs(selectedCombo.endDate).format('DD/MM/YYYY')}</p></div>
                <div><p className="text-gray-400">Status:</p><p>{formatStatusLabel(getComboStatus(selectedCombo))}</p></div>
                <div className="col-span-2">
                  <p className="text-gray-400">Items:</p>
                  <ul className="list-disc pl-5">
                    {selectedCombo.items.map((item, index) => (
                      <li key={index}>
                        {item.productName} (x{item.quantity})
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-400">Image:</p>
                  <img src={selectedCombo.image_url} alt="Combo" className="max-w-xs w-full h-auto rounded-md shadow mx-auto" />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default ViewCombo;