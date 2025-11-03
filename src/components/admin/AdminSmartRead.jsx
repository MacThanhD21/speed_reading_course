import React, { useEffect, useState } from 'react';
import { FaBook, FaTachometerAlt, FaBrain, FaChartLine, FaUser, FaChevronDown, FaChevronUp, FaEye, FaCalendarAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import apiService from '../../services/apiService';

const AdminSmartRead = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [userSessions, setUserSessions] = useState({});
  const [loadingSessions, setLoadingSessions] = useState({});
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadDashboardStats();
    loadUsers();
  }, [pagination.page, search]);

  const loadDashboardStats = async () => {
    try {
      const response = await apiService.getDashboardStats();
      setStats(response.data?.smartread || null);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (search) params.search = search;

      const response = await apiService.getUsersWithSmartReadStats(params);
      setUsers(response.data || []);
      setPagination(prev => ({
        ...prev,
        total: response.pagination?.total || 0,
        pages: response.pagination?.pages || 1,
      }));
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSessions = async (userId) => {
    if (userSessions[userId]) return; // Already loaded

    setLoadingSessions(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await apiService.getUserReadingSessions(userId, { page: 1, limit: 10 });
      setUserSessions(prev => ({
        ...prev,
        [userId]: response.data || [],
      }));
    } catch (error) {
      console.error('Error loading user sessions:', error);
      setUserSessions(prev => ({
        ...prev,
        [userId]: [],
      }));
    } finally {
      setLoadingSessions(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleToggleUser = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
      loadUserSessions(userId);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A66CC]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section 1: Thống kê tổng quan */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Thống kê tổng quan</h2>
        
        {stats && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Tổng phiên đọc</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalSessions || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">+{stats.last7Days || 0} tuần này</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <FaBook className="text-white text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Kết quả quiz</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalQuizResults || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Tổng kết quả</p>
                  </div>
                  <div className="bg-purple-500 p-3 rounded-lg">
                    <FaBrain className="text-white text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">WPM trung bình</p>
                    <p className="text-3xl font-bold text-gray-800">{Math.round(stats.avgWpm || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Từ/phút</p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-lg">
                    <FaTachometerAlt className="text-white text-2xl" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">REI trung bình</p>
                    <p className="text-3xl font-bold text-gray-800">{Math.round(stats.avgRei || 0)}</p>
                    <p className="text-xs text-gray-500 mt-1">Hiệu quả đọc</p>
                  </div>
                  <div className="bg-orange-500 p-3 rounded-lg">
                    <FaChartLine className="text-white text-2xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Thống kê phiên đọc</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng phiên đọc:</span>
                    <span className="font-medium">{stats.totalSessions || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">7 ngày gần nhất:</span>
                    <span className="font-medium">{stats.last7Days || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">30 ngày gần nhất:</span>
                    <span className="font-medium">{stats.last30Days || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Người dùng hoạt động:</span>
                    <span className="font-medium">{stats.activeUsers || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Thống kê hiệu quả</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">WPM trung bình:</span>
                    <span className="font-medium">{Math.round(stats.avgWpm || 0)} từ/phút</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">REI trung bình:</span>
                    <span className="font-medium">{Math.round(stats.avgRei || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hiểu biết trung bình:</span>
                    <span className="font-medium">{Math.round(stats.avgComprehension || 0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng kết quả quiz:</span>
                    <span className="font-medium">{stats.totalQuizResults || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Section 2: Thống kê chi tiết theo từng người dùng */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">👥 Thống kê theo người dùng</h2>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A66CC] focus:border-[#1A66CC]"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A66CC] mx-auto"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy người dùng nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phiên đọc
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quiz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WPM TB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      REI TB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hiểu biết TB
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hoạt động gần nhất
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const stats = user.smartreadStats || {};
                    const isExpanded = expandedUser === user._id;

                    return (
                      <React.Fragment key={user._id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-full mr-3">
                                <FaUser className="text-[#1A66CC]" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stats.totalSessions || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {stats.totalQuizResults || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.round(stats.avgWpm || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.round(stats.avgRei || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.round(stats.avgComprehension || 0)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {stats.lastActivity ? formatDate(stats.lastActivity) : 'Chưa có'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleToggleUser(user._id)}
                              className="text-[#1A66CC] hover:text-[#1555B0] flex items-center gap-2"
                            >
                              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                              {isExpanded ? 'Thu gọn' : 'Mở rộng'}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded row - User sessions */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <td colSpan="8" className="px-6 py-4 bg-gray-50">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-700">
                                      Lịch sử phiên đọc của {user.name}
                                    </h3>
                                    <div className="flex gap-2 text-sm text-gray-600">
                                      <span>WPM tốt nhất: <strong>{Math.round(stats.bestWpm || 0)}</strong></span>
                                      <span>|</span>
                                      <span>REI tốt nhất: <strong>{Math.round(stats.bestRei || 0)}</strong></span>
                                    </div>
                                  </div>

                                  {loadingSessions[user._id] ? (
                                    <div className="text-center py-4">
                                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1A66CC] mx-auto"></div>
                                    </div>
                                  ) : !userSessions[user._id] || userSessions[user._id].length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                      Người dùng này chưa có phiên đọc nào
                                    </div>
                                  ) : (
                                    <div className="space-y-2">
                                      {userSessions[user._id].map((session) => (
                                        <div
                                          key={session._id}
                                          className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                                        >
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <div className="flex items-center gap-2 mb-2">
                                                <FaCalendarAlt className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">
                                                  {session.content?.title || 'Văn bản đã dán'}
                                                </span>
                                              </div>
                                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                  <span className="text-gray-500">WPM:</span>
                                                  <span className="ml-2 font-medium">{Math.round(session.readingStats?.wpm || 0)}</span>
                                                </div>
                                                <div>
                                                  <span className="text-gray-500">Thời gian:</span>
                                                  <span className="ml-2 font-medium">
                                                    {Math.round((session.readingStats?.duration || 0) / 1000)}s
                                                  </span>
                                                </div>
                                                <div>
                                                  <span className="text-gray-500">Số từ:</span>
                                                  <span className="ml-2 font-medium">{session.content?.wordCount || 0}</span>
                                                </div>
                                                <div>
                                                  <span className="text-gray-500">Ngày:</span>
                                                  <span className="ml-2 font-medium">{formatDate(session.createdAt)}</span>
                                                </div>
                                              </div>
                                              {session.quizResult && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                  <div className="flex items-center gap-2 text-sm">
                                                    <FaBrain className="text-purple-500" />
                                                    <span className="text-gray-600">Quiz: </span>
                                                    <span className="font-medium text-purple-600">
                                                      {session.quizResult.results?.correctCount || 0}/
                                                      {session.quizResult.results?.totalQuestions || 0} (
                                                      {Math.round(session.quizResult.results?.comprehensionPercent || 0)}%)
                                                    </span>
                                                    <span className="text-gray-400">|</span>
                                                    <span className="text-gray-600">REI: </span>
                                                    <span className="font-medium text-orange-600">
                                                      {Math.round(session.quizResult.metrics?.rei || 0)}
                                                    </span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-700">
                Trang {pagination.page} / {pagination.pages || 1} ({pagination.total} người dùng)
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages || 1, prev.page + 1) }))}
                  disabled={pagination.page >= (pagination.pages || 1)}
                  className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSmartRead;
