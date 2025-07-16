import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import { Modal, message, Tag } from 'antd';
import Pagination from '../../components/PaginationHomepage';
import SidebarLayout from '../../components/Sidebar-Employee';
import axios from 'axios';

const ViewProduct = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  const formatVND = (value) => {
    if (typeof value !== 'number') return '';
    return `${value.toLocaleString('vi-VN')} VND`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/product', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProducts(response.data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
        message.error(`Failed to fetch products: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, products]);

  const totalProducts = products.length;
  const activeProducts = products.filter(product => !product.is_deleted).length;
  const inactiveProducts = products.filter(product => product.is_deleted).length;

  const confirmDelete = async (product) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: `Are you sure you want to delete "${product.productName}"?`,
      okText: 'Delete',
      cancelText: 'Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.patch(`http://localhost:5000/api/product/${product._id}/delete`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const updated = products.filter(p => p._id !== product._id);
          setProducts(updated);
          message.success(`"${product.productName}" đã được xóa thành công.`);
        } catch (error) {
          console.error('Error deleting product:', error);
          message.error(`Failed to delete "${product.productName}": ${error.message}`);
        }
      },
    });
  };

  const showProductDetails = (product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const filteredProducts = products.filter(product =>
    product.productName?.trim().toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(0);
    }
  }, [totalPages, currentPage]);

  const paginatedProducts = filteredProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageChange = page => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
  };

  const formatStatusLabel = (status) => {
    return status ? 'Inactive' : 'Active';
  };

  return (
    <SidebarLayout>
      <div className="p-6 text-white">
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold">Product Management</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-300">Total Products</p>
            <h2 className="text-xl font-bold">{totalProducts}</h2>
          </div>
          <div className="bg-green-700 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-100">Active</p>
            <h2 className="text-xl font-bold">{activeProducts}</h2>
          </div>
          <div className="bg-red-600 rounded-lg p-4 text-center shadow">
            <p className="text-sm text-gray-100">Inactive</p>
            <h2 className="text-xl font-bold">{inactiveProducts}</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Search product..."
            value={searchTerm}
            onChange={handleSearch}
            className="bg-gray-700 text-white px-3 py-2 rounded-md w-64"
          />
          <Link to="/employee/add-product" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md">
            + Add New Product
          </Link>
        </div>

        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900 text-gray-300 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700 text-gray-300 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <FaSpinner className="animate-spin mr-2" /> Loading products...
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-400">No products found.</td>
                </tr>
              ) : (
                paginatedProducts.map((product, index) => (
                  <tr key={product._id} className="hover:bg-gray-700 transition">
                    <td className="px-4 py-2">{(currentPage * itemsPerPage + index + 1)}</td>
                    <td className="px-4 py-2">{product.productName}</td>
                    <td className="px-4 py-2">{formatVND(product.price)}</td>
                    <td className="px-4 py-2">{product.category}</td>
                    <td className="px-4 py-2">{product.stockQuantity}</td>
                    <td className="px-4 py-2">
                      <Tag color={product.is_deleted ? 'red' : 'green'}>
                        {formatStatusLabel(product.is_deleted)}
                      </Tag>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex justify-center gap-4">
                        <button onClick={() => showProductDetails(product)} className="text-blue-400 hover:text-blue-600 text-xl"><FaEye /></button>
                        <button onClick={() => window.location.href = '/employee/view-product/edit-product/' + product._id} className="text-yellow-400 hover:text-yellow-600 text-xl"><FaEdit /></button>
                        <button onClick={() => confirmDelete(product)} className="text-red-400 hover:text-red-600 text-xl"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
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
          title="Product Details"
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
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-black">
                <div><p className="text-gray-400">Product Name:</p><p>{selectedProduct.productName}</p></div>
                <div><p className="text-gray-400">Price:</p><p>{formatVND(selectedProduct.price)}</p></div>
                <div><p className="text-gray-400">Category:</p><p>{selectedProduct.category}</p></div>
                <div><p className="text-gray-400">Stock Quantity:</p><p>{selectedProduct.stockQuantity}</p></div>
                <div><p className="text-gray-400">Description:</p><p>{selectedProduct.description}</p></div>
                <div><p className="text-gray-400">Status:</p><p>{formatStatusLabel(selectedProduct.is_deleted)}</p></div>
                <div className="col-span-2">
                  <p className="text-gray-400">Image:</p>
                  <img src={selectedProduct.image_url} alt="Product" className="w-48 h-auto rounded-md shadow object-cover" />
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </SidebarLayout>
  );
};

export default ViewProduct;