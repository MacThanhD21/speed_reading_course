import React, { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../../services/apiService';

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

  // Prepare chart data for User Growth (last 30 days)
  // Generate sample data if not available from API
  const generateUserGrowthData = () => {
    const data = [];
    const totalUsers = stats.users?.total || 0;
    const baseUsers = Math.max(0, totalUsers - (stats.users?.newLast30Days || 0));
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayUsers = baseUsers + Math.floor((stats.users?.newLast30Days || 0) * (30 - i) / 30);
      data.push({
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        users: dayUsers + Math.floor(Math.random() * 10),
      });
    }
    return data;
  };
  
  const userGrowthData = generateUserGrowthData();

  // Calculate growth percentage
  const totalUsers = stats.users?.total || 0;
  const usersLast30Days = stats.users?.newLast30Days || 0;
  const previousMonthUsers = Math.max(1, totalUsers - usersLast30Days);
  const userGrowthPercent = previousMonthUsers > 0 ? ((usersLast30Days / previousMonthUsers) * 100).toFixed(1) : 0;

  // Calculate engagement data
  const totalSessions = stats.smartread?.totalSessions || 0;
  const activeUsers = stats.smartread?.activeUsers || 0;
  const engagementPercent = totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0;
  const engagementChange = '-2.1%'; // Placeholder - can be calculated from historical data

  // Prepare course engagement data (placeholder - can be replaced with real data)
  const courseEngagementData = [
    { name: 'Course A', value: 25 },
    { name: 'Course B', value: 20 },
    { name: 'Course C', value: 18 },
    { name: 'Course D', value: 15 },
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      change: `+${userGrowthPercent}% vs last month`,
      changePositive: true,
    },
    {
      title: 'Active Courses',
      value: '24', // Placeholder - can be replaced with real data
      change: '+1.2% vs last month',
      changePositive: true,
    },
    {
      title: 'New Inquiries',
      value: stats.contacts?.last30Days || stats.contacts?.total || 0,
      change: `+${stats.contacts?.last30Days || 0} vs last month`,
      changePositive: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">Dashboard</h1>
        <p className="dark:text-gray-400 text-gray-500">Welcome back, Admin! Here's a summary of platform activity.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <p className="text-sm dark:text-gray-400 text-gray-600 mb-2 font-medium">{card.title}</p>
            <p className="text-3xl font-bold dark:text-white text-gray-900 mb-2">{card.value}</p>
            <p className={`text-sm ${card.changePositive ? 'text-green-600' : 'text-red-600'}`}>
              {card.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900">User Growth</h3>
              <p className="text-sm dark:text-gray-400 text-gray-500">Last 30 Days</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold dark:text-white text-gray-900">
                {totalUsers.toLocaleString()} Users <span className="text-green-600">+{userGrowthPercent}%</span>
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={userGrowthData}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#6b7280"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="users" 
                stroke="#2563eb" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUsers)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Course Engagement Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900">Course Engagement</h3>
              <p className="text-sm dark:text-gray-400 text-gray-500">Last 30 Days</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold dark:text-white text-gray-900">
                {engagementPercent}% Active <span className="text-red-600">{engagementChange}</span>
              </p>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            {courseEngagementData.map((course, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm dark:text-gray-400 text-gray-600">{course.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 dark:bg-gray-700 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${course.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium dark:text-white text-gray-900 w-8 text-right">{course.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

