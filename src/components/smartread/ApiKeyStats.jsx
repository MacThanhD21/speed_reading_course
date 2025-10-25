/**
 * API Key Stats Component - Hiển thị thống kê API keys
 */
import React, { useState, useEffect } from 'react';
import { FaKey, FaChartBar, FaSync, FaExclamationTriangle, FaCheckCircle, FaClock } from 'react-icons/fa';
import geminiService from '../services/geminiService';

const ApiKeyStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const apiStats = geminiService.getApiKeyStats();
      setStats(apiStats);
    } catch (error) {
      console.error('Error loading API stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetKeys = async () => {
    setIsLoading(true);
    try {
      geminiService.resetApiKeys();
      await loadStats();
    } catch (error) {
      console.error('Error resetting API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <FaChartBar className="text-2xl text-gray-400 mr-2" />
          <span className="text-gray-600">Loading API Key Stats...</span>
        </div>
      </div>
    );
  }

  const getKeyStatusIcon = (keyStat) => {
    if (!keyStat.isActive) return <FaExclamationTriangle className="text-red-500" />;
    if (keyStat.quotaExceeded) return <FaClock className="text-yellow-500" />;
    return <FaCheckCircle className="text-green-500" />;
  };

  const getKeyStatusText = (keyStat) => {
    if (!keyStat.isActive) return 'Tạm ngưng';
    if (keyStat.quotaExceeded) return 'Hết quota';
    return 'Hoạt động';
  };

  const getKeyStatusColor = (keyStat) => {
    if (!keyStat.isActive) return 'text-red-600';
    if (keyStat.quotaExceeded) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FaKey className="text-2xl text-blue-600 mr-3" />
          <div>
            <h3 className="text-xl font-bold text-gray-800">API Key Manager</h3>
            <p className="text-sm text-gray-600">Quản lý và load balance API keys</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={loadStats}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            <FaSync className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={resetKeys}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            Reset Keys
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalKeys}</div>
          <div className="text-sm text-gray-600">Total Keys</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.activeKeys}</div>
          <div className="text-sm text-gray-600">Active Keys</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.quotaExceededKeys}</div>
          <div className="text-sm text-gray-600">Quota Exceeded</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalRequests}</div>
          <div className="text-sm text-gray-600">Total Requests</div>
        </div>
      </div>

      {/* Key Details */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold text-gray-800 mb-3">Chi tiết từng API Key</h4>
        <div className="space-y-2">
          {stats.keyDetails.map((keyStat) => (
            <div
              key={keyStat.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getKeyStatusIcon(keyStat)}
                <div>
                  <div className="font-medium text-gray-800">
                    Key {keyStat.id}: {keyStat.key.substring(0, 15)}...
                  </div>
                  <div className="text-sm text-gray-600">
                    Requests: {keyStat.requests} | Errors: {keyStat.errors}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-medium ${getKeyStatusColor(keyStat)}`}>
                  {getKeyStatusText(keyStat)}
                </span>
                <div className="text-xs text-gray-500">
                  Last used: {keyStat.lastUsed}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin hiệu suất</h4>
        <div className="text-sm text-gray-600">
          <p>• Tự động load balance giữa các API keys</p>
          <p>• Rate limiting: 15 requests/phút/key</p>
          <p>• Auto-retry khi key hết quota</p>
          <p>• Queue system để tránh spam requests</p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyStats;
