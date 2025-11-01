import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaUsers, FaEnvelope, FaUserPlus, FaChartLine } from 'react-icons/fa';
import apiService from '../../services/apiService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await apiService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-600">Không thể tải dữ liệu</div>;
  }

  // Prepare chart data
  const contactsByDay = stats.contacts?.byDay?.map(item => ({
    date: item._id,
    contacts: item.count,
  })) || [];

  const contactsByStatus = Object.entries(stats.contacts?.byStatus || {}).map(([name, value]) => ({
    name: name === 'new' ? 'Mới' : name === 'contacted' ? 'Đã liên hệ' : name === 'completed' ? 'Hoàn thành' : name,
    value,
  }));

  const contactsBySource = Object.entries(stats.contacts?.bySource || {}).map(([name, value]) => ({
    name: name === 'homepage' ? 'Trang chủ' : name,
    value,
  }));

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.users?.total || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      change: `+${stats.users?.newLast30Days || 0} tháng này`,
    },
    {
      title: 'Tổng liên hệ',
      value: stats.contacts?.total || 0,
      icon: FaEnvelope,
      color: 'bg-green-500',
      change: `+${stats.contacts?.last7Days || 0} tuần này`,
    },
    {
      title: 'Phiên đọc SmartRead',
      value: stats.smartread?.totalSessions || 0,
      icon: FaChartLine,
      color: 'bg-purple-500',
      change: `+${stats.smartread?.last7Days || 0} tuần này`,
    },
    {
      title: 'Người dùng hoạt động',
      value: stats.smartread?.activeUsers || 0,
      icon: FaUserPlus,
      color: 'bg-orange-500',
      change: `WPM trung bình: ${Math.round(stats.smartread?.avgWpm || 0)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">📊 Dashboard</h1>
        <p className="text-blue-100">Tổng quan về hoạt động của hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1 font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-800">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.change}</p>
                </div>
                <div className={`${card.color} p-4 rounded-xl shadow-lg`}>
                  <Icon className="text-white text-2xl" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contacts by Day */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Liên hệ theo ngày (7 ngày gần nhất)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={contactsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="contacts" stroke="#0088FE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Contacts by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Liên hệ theo trạng thái</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contactsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contactsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* SmartRead Statistics */}
          {stats.smartread && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-6 border border-purple-100"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Thống kê SmartRead</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng phiên đọc:</span>
                  <span className="font-bold text-gray-800">{stats.smartread.totalSessions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Kết quả quiz:</span>
                  <span className="font-bold text-gray-800">{stats.smartread.totalQuizResults || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">WPM trung bình:</span>
                  <span className="font-bold text-gray-800">{Math.round(stats.smartread.avgWpm || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">REI trung bình:</span>
                  <span className="font-bold text-gray-800">{Math.round(stats.smartread.avgRei || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hiểu biết trung bình:</span>
                  <span className="font-bold text-gray-800">{Math.round(stats.smartread.avgComprehension || 0)}%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Contacts by Source */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Liên hệ theo nguồn</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={contactsBySource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
    </div>
  );
};

export default AdminDashboard;

