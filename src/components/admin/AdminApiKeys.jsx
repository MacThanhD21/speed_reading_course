import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaSync,
  FaKey,
  FaClock,
  FaChartLine
} from 'react-icons/fa';
import apiService from '../../services/apiService';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../common/ConfirmDialog';

const AdminApiKeys = () => {
  const { showSuccess, showError } = useNotification();
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [currentKey, setCurrentKey] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [testingAll, setTestingAll] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      const response = await apiService.getApiKeys();
      if (response.success) {
        setApiKeys(response.data || []);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (key = null) => {
    if (key) {
      setFormData({
        key: '',
        name: key.name || '',
        description: key.description || '',
        isActive: key.isActive !== undefined ? key.isActive : true,
      });
      setCurrentKey(key);
    } else {
      setFormData({
        key: '',
        name: '',
        description: '',
        isActive: true,
      });
      setCurrentKey(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentKey(null);
    setFormData({
      key: '',
      name: '',
      description: '',
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentKey) {
        // Update
        await apiService.updateApiKey(currentKey._id, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        });
      } else {
        // Create
        await apiService.createApiKey(formData);
      }
      handleCloseModal();
      loadApiKeys();
      showSuccess(currentKey ? 'Cập nhật API key thành công' : 'Thêm API key thành công');
    } catch (error) {
      showError(error.message || 'Có lỗi xảy ra', 'Lỗi');
    }
  };

  const handleDelete = (id) => {
    setCurrentKey({ _id: id });
    setConfirmAction(() => async () => {
      try {
        await apiService.deleteApiKey(id);
        loadApiKeys();
        showSuccess('Xóa API key thành công');
      } catch (error) {
        showError(error.message || 'Lỗi khi xóa', 'Lỗi');
      }
    });
    setIsConfirmDialogOpen(true);
  };

  const handleTest = async (key) => {
    setTesting(true);
    setTestResult(null);
    setIsTestModalOpen(true);
    try {
      const response = await apiService.testApiKey(key._id);
      setTestResult(response);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || 'Lỗi khi kiểm tra',
      });
    } finally {
      setTesting(false);
      loadApiKeys(); // Reload to update status
    }
  };

  const handleTestAll = async () => {
    setTestingAll(true);
    try {
      const response = await apiService.testAllApiKeys();
      showSuccess(`Đã kiểm tra ${response.data?.length || 0} API keys`, 'Kiểm tra hoàn tất');
      loadApiKeys();
    } catch (error) {
      showError(error.message || 'Lỗi khi kiểm tra', 'Lỗi');
    } finally {
      setTestingAll(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rate_limited':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return <FaCheckCircle className="text-[#34D399]" />;
      case 'rate_limited':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500 dark:text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'healthy':
        return 'Hoạt động tốt';
      case 'rate_limited':
        return 'Rate Limited';
      case 'error':
        return 'Lỗi';
      default:
        return 'Chưa kiểm tra';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    total: apiKeys.length,
    active: apiKeys.filter(k => k.isActive).length,
    healthy: apiKeys.filter(k => k.healthStatus === 'healthy').length,
    error: apiKeys.filter(k => k.healthStatus === 'error').length,
    rateLimited: apiKeys.filter(k => k.healthStatus === 'rate_limited').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A66CC] to-[#124A9D] rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FaKey /> Quản lý API Keys
            </h1>
            <p className="text-blue-50">Quản lý và kiểm tra sức khỏe của Gemini API keys</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleTestAll}
              disabled={testingAll || apiKeys.length === 0}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FaSync className={testingAll ? 'animate-spin' : ''} />
              Kiểm tra tất cả
            </button>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-white dark:bg-gray-700 text-[#1A66CC] dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex items-center gap-2 font-semibold"
            >
              <FaPlus /> Thêm API Key
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Tổng số</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.total}</p>
            </div>
            <FaKey className="text-2xl text-[#1A66CC]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Đang hoạt động</p>
              <p className="text-2xl font-bold text-[#34D399]">{stats.active}</p>
            </div>
            <FaCheckCircle className="text-2xl text-[#34D399]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Hoạt động tốt</p>
              <p className="text-2xl font-bold text-[#1A66CC]">{stats.healthy}</p>
            </div>
            <FaCheckCircle className="text-2xl text-[#1A66CC]" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Có lỗi</p>
              <p className="text-2xl font-bold text-red-600">{stats.error}</p>
            </div>
            <FaTimesCircle className="text-2xl text-red-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-100 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Rate Limited</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.rateLimited}</p>
            </div>
            <FaExclamationTriangle className="text-2xl text-yellow-500" />
          </div>
        </motion.div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Tên</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">API Key</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Thống kê</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Kiểm tra</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Chưa có API key nào. Hãy thêm API key mới!
                  </td>
                </tr>
              ) : (
                apiKeys.map((key) => (
                  <motion.tr
                    key={key._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{key.name || 'Unnamed'}</p>
                        {key.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{key.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-300 font-mono">
                        {key.key || key.fullKey || 'N/A'}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(key.healthStatus)} flex items-center gap-2`}>
                          {getStatusIcon(key.healthStatus)}
                          {getStatusText(key.healthStatus)}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${key.isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {key.lastChecked && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Kiểm tra: {new Date(key.lastChecked).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600 dark:text-gray-400">
                          <FaChartLine className="inline mr-1" />
                          Requests: {key.stats?.totalRequests || 0}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Thành công: <span className="text-green-600 dark:text-green-400">{key.stats?.successfulRequests || 0}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Thất bại: <span className="text-red-600 dark:text-red-400">{key.stats?.failedRequests || 0}</span>
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTest(key)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                      >
                        <FaSync /> Kiểm tra
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(key)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(key._id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                {currentKey ? 'Chỉnh sửa API Key' : 'Thêm API Key mới'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!currentKey && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Key <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                      placeholder="AIzaSy..."
                      className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">API key phải bắt đầu bằng "AIza"</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tên API key"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả (optional)"
                    rows="3"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                    Kích hoạt
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {currentKey ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Result Modal */}
      <AnimatePresence>
        {isTestModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsTestModalOpen(false)}
          >
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Kết quả kiểm tra</h3>
              {testing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : testResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'}`}>
                    <p className={`font-medium ${testResult.success ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                      {testResult.message || testResult.data?.message}
                    </p>
                    {testResult.data?.healthStatus && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Trạng thái: <span className="font-semibold">{getStatusText(testResult.data.healthStatus)}</span>
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsTestModalOpen(false)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Đóng
                  </button>
                </div>
              ) : null}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApiKeys;

