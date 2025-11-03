import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaCheck, FaTimes, FaStar, FaUser } from 'react-icons/fa';
import apiService from '../../services/apiService';
import { useNotification } from '../../context/NotificationContext';
import ConfirmDialog from '../common/ConfirmDialog';

const AdminTestimonials = () => {
  const { showSuccess, showError } = useNotification();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'all', 'active', 'inactive'
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  useEffect(() => {
    loadTestimonials();
  }, [pagination.page, search, statusFilter]);

  const loadTestimonials = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) params.search = search;

      const response = await apiService.getAdminTestimonials(params);
      let filteredData = response.data || [];
      
      // Filter by status
      if (statusFilter === 'active') {
        filteredData = filteredData.filter(t => t.isActive);
      } else if (statusFilter === 'inactive') {
        filteredData = filteredData.filter(t => !t.isActive);
      }

      setTestimonials(filteredData);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
      }));
    } catch (error) {
      console.error('Error loading testimonials:', error);
      showError(error.message || 'Lỗi khi tải danh sách đánh giá', 'Lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (testimonial) => {
    try {
      await apiService.updateAdminTestimonial(testimonial._id, {
        isActive: !testimonial.isActive,
      });
      loadTestimonials();
      showSuccess(
        testimonial.isActive 
          ? 'Đã ẩn đánh giá' 
          : 'Đã duyệt và hiển thị đánh giá',
        'Thành công'
      );
    } catch (error) {
      showError(error.message || 'Lỗi khi cập nhật', 'Lỗi');
    }
  };

  const handleDelete = (testimonial) => {
    setTestimonialToDelete(testimonial);
    setConfirmAction(() => async () => {
      try {
        await apiService.deleteTestimonial(testimonial._id);
        loadTestimonials();
        showSuccess('Xóa đánh giá thành công');
      } catch (error) {
        showError(error.message || 'Lỗi khi xóa', 'Lỗi');
      }
    });
    setIsConfirmDialogOpen(true);
  };

  const handleUpdate = async (testimonialId, updates) => {
    try {
      await apiService.updateAdminTestimonial(testimonialId, updates);
      loadTestimonials();
      setEditingTestimonial(null);
      showSuccess('Cập nhật đánh giá thành công');
    } catch (error) {
      showError(error.message || 'Lỗi khi cập nhật', 'Lỗi');
    }
  };

  if (loading && testimonials.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A66CC]"></div>
      </div>
    );
  }

  const pendingCount = testimonials.filter(t => !t.isActive).length;
  const activeCount = testimonials.filter(t => t.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý Đánh giá</h2>
          <p className="text-gray-600 mt-1">Duyệt và quản lý đánh giá từ học viên</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng số</p>
              <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaStar className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Chờ duyệt</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaTimes className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã duyệt</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCheck className="text-green-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, vai trò, nội dung..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đã duyệt</option>
            <option value="inactive">Chờ duyệt</option>
          </select>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <FaStar className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-600">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                {editingTestimonial?._id === testimonial._id ? (
                  <EditTestimonialForm
                    testimonial={editingTestimonial}
                    onSave={(updates) => handleUpdate(testimonial._id, updates)}
                    onCancel={() => setEditingTestimonial(null)}
                  />
                ) : (
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Avatar & Rating */}
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{testimonial.avatar}</div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < testimonial.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaUser className="w-3 h-3" />
                          <span>{testimonial.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {testimonial.role}
                        </span>
                        {testimonial.improvement && (
                          <span className="ml-2 inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {testimonial.improvement}
                          </span>
                        )}
                      </div>
                      <blockquote className="text-gray-700 italic mb-2">
                        "{testimonial.quote}"
                      </blockquote>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>
                          {testimonial.user?.email || 'N/A'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(testimonial.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(testimonial)}
                        className={`p-2 rounded-lg transition-colors ${
                          testimonial.isActive
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                        title={testimonial.isActive ? 'Ẩn đánh giá' : 'Duyệt đánh giá'}
                      >
                        {testimonial.isActive ? <FaTimes /> : <FaCheck />}
                      </button>
                      <button
                        onClick={() => setEditingTestimonial(testimonial)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {pagination.page} / {pagination.pages}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= pagination.pages}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Sau
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setIsConfirmDialogOpen(false);
        }}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa đánh giá từ "${testimonialToDelete?.name}"?`}
      />
    </div>
  );
};

const EditTestimonialForm = ({ testimonial, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: testimonial.name || '',
    role: testimonial.role || '',
    quote: testimonial.quote || '',
    rating: testimonial.rating || 5,
    improvement: testimonial.improvement || '',
    isActive: testimonial.isActive || false,
    displayOrder: testimonial.displayOrder || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá</label>
        <textarea
          value={formData.quote}
          onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none resize-none"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Đánh giá</label>
          <select
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
          >
            {[1, 2, 3, 4, 5].map(r => (
              <option key={r} value={r}>{r} sao</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cải thiện</label>
          <input
            type="text"
            value={formData.improvement}
            onChange={(e) => setFormData({ ...formData, improvement: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
            placeholder="250 → 800 WPM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
          <input
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-transparent outline-none"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          className="w-4 h-4 text-[#1A66CC] rounded focus:ring-[#1A66CC]"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Hiển thị công khai
        </label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-[#1A66CC] text-white rounded-lg hover:bg-[#1555B0] transition-colors"
        >
          Lưu
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Hủy
        </button>
      </div>
    </form>
  );
};

export default AdminTestimonials;

