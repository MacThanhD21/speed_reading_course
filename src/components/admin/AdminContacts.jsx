import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaEnvelope, FaCheck } from 'react-icons/fa';
import apiService from '../../services/apiService';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../common/ConfirmDialog';

const AdminContacts = () => {
  const { showSuccess, showError } = useNotification();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [contactToDelete, setContactToDelete] = useState(null);

  useEffect(() => {
    loadContacts();
  }, [pagination.page, search, statusFilter]);

  const loadContacts = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await apiService.getContacts(params);
      setContacts(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
      }));
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContact = async (contactId, updates) => {
    try {
      await apiService.updateContact(contactId, updates);
      loadContacts();
      showSuccess('Cập nhật liên hệ thành công');
    } catch (error) {
      showError(error.message || 'Lỗi khi cập nhật', 'Lỗi');
    }
  };

  const handleDeleteContact = (contactId) => {
    setContactToDelete(contactId);
    setConfirmAction(() => async () => {
      try {
        await apiService.deleteContact(contactId);
        loadContacts();
        showSuccess('Xóa liên hệ thành công');
      } catch (error) {
        showError(error.message || 'Lỗi khi xóa', 'Lỗi');
      }
    });
    setIsConfirmDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { label: 'Mới', color: 'bg-blue-100 dark:bg-blue-900 text-[#1A66CC] dark:text-blue-300' },
      contacted: { label: 'Đã liên hệ', color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' },
      completed: { label: 'Hoàn thành', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' },
      archived: { label: 'Lưu trữ', color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' },
    };
    const config = statusConfig[status] || statusConfig.new;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center text-gray-900 dark:text-white">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Quản lý liên hệ</h2>
          <div className="flex space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="new">Mới</option>
              <option value="contacted">Đã liên hệ</option>
              <option value="completed">Hoàn thành</option>
              <option value="archived">Lưu trữ</option>
            </select>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Số điện thoại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tin nhắn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ngày gửi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {contacts.map((contact) => (
                <tr key={contact._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{contact.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{contact.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">{contact.phone || '-'}</td>
                  <td className="px-6 py-4 max-w-xs truncate text-gray-900 dark:text-white">{contact.message || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(contact.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        const newStatus = contact.status === 'new' ? 'contacted' : 
                                         contact.status === 'contacted' ? 'completed' : 'archived';
                        handleUpdateContact(contact._id, { status: newStatus });
                      }}
                      className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                      title="Cập nhật trạng thái"
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => handleDeleteContact(contact._id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Trang {pagination.page} / {pagination.pages || 1}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages || 1, prev.page + 1) }))}
              disabled={pagination.page >= (pagination.pages || 1)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => {
          setIsConfirmDialogOpen(false);
          setConfirmAction(null);
          setContactToDelete(null);
        }}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction();
          }
        }}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa liên hệ này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default AdminContacts;

