/**
 * API Key Manager - Quản lý và load balance nhiều API keys
 * Đảm bảo luôn có thể đáp ứng request của người dùng
 */

import logger from '../utils/logger.js';

class ApiKeyManager {
  constructor() {
    // Danh sách API keys
    this.apiKeys = [
      "AIzaSyCT1FqXtbVLeqJj-7WYPGDVbTF9RSq7z90",
      "AIzaSyB25KpRF3v7vBOMDNaoRocYMA63zCohUAw",
      "AIzaSyC9ST6XCn2yTVwPBW5SV9GCZKDmOBajbls",
      "AIzaSyDW_ij25U5wFkYfgVa-D4jKcjE2MO-s_dU",
      "AIzaSyADhyG_AvMr4QIkTE9WPB4h42769BnnfLM"
    ];

    // Thông tin về từng API key
    this.keyStats = this.apiKeys.map((key, index) => ({
      key,
      id: index,
      requestsCount: 0,
      lastUsed: 0,
      isActive: true,
      errorCount: 0,
      lastError: null,
      quotaExceeded: false,
      rateLimitReset: 0
    }));

    // Cấu hình rate limiting
    this.rateLimitConfig = {
      maxRequestsPerMinute: 15, // Gemini free tier limit
      maxRequestsPerHour: 1000,
      cooldownPeriod: 60000, // 1 phút
      errorThreshold: 3 // Số lỗi tối đa trước khi tạm ngưng key
    };

    // Index của key hiện tại đang sử dụng
    this.currentKeyIndex = 0;
    
    // Queue để quản lý request
    this.requestQueue = [];
    this.isProcessingQueue = false;

    logger.info('API_KEY_MANAGER', `Initialized with ${this.apiKeys.length} keys`);
    
    // Reset all keys to fresh state
    this.resetAllKeys();
  }

  /**
   * Lấy API key tiếp theo theo chiến lược load balancing
   */
  getNextApiKey() {
    const availableKeys = this.keyStats.filter(stat => 
      stat.isActive && 
      !stat.quotaExceeded
    );

    if (availableKeys.length === 0) {
      logger.warn('API_KEY_MANAGER', 'No available API keys, using fallback strategy');
      return this.getFallbackKey();
    }

    // Round-robin load balancing
    const selectedKey = availableKeys[this.currentKeyIndex % availableKeys.length];
    this.currentKeyIndex = (this.currentKeyIndex + 1) % availableKeys.length;

    logger.debug('API_KEY_MANAGER', `Selected API key ${selectedKey.id}`, { 
      keyPreview: selectedKey.key.substring(0, 10) + '...',
      availableKeys: availableKeys.length,
      currentIndex: this.currentKeyIndex
    });
    return selectedKey;
  }

  /**
   * Lấy fallback key khi tất cả keys đều có vấn đề
   */
  getFallbackKey() {
    // Sắp xếp theo số lỗi ít nhất và thời gian không sử dụng lâu nhất
    const sortedKeys = this.keyStats
      .filter(stat => stat.isActive)
      .sort((a, b) => {
        if (a.errorCount !== b.errorCount) {
          return a.errorCount - b.errorCount;
        }
        return a.lastUsed - b.lastUsed;
      });

    if (sortedKeys.length > 0) {
      const fallbackKey = sortedKeys[0];
      logger.warn('API_KEY_MANAGER', `Using fallback key ${fallbackKey.id}`, {
        errorCount: fallbackKey.errorCount,
        lastUsed: fallbackKey.lastUsed
      });
      return fallbackKey;
    }

    // Nếu tất cả đều có vấn đề, reset và thử lại
    logger.warn('API_KEY_MANAGER', 'All keys have issues, resetting error counts');
    this.resetAllKeys();
    return this.keyStats[0];
  }

  /**
   * Reset tất cả keys về trạng thái ban đầu
   */
  resetAllKeys() {
    this.keyStats.forEach(stat => {
      stat.errorCount = 0;
      stat.quotaExceeded = false;
      stat.lastError = null;
      stat.isActive = true;
    });
    logger.info('API_KEY_MANAGER', 'All API keys reset');
  }

  /**
   * Cập nhật thống kê sau khi sử dụng API key
   */
  updateKeyStats(keyId, success = true, error = null) {
    const keyStat = this.keyStats.find(stat => stat.id === keyId);
    if (!keyStat) return;

    keyStat.lastUsed = Date.now();
    
    if (success) {
      keyStat.requestsCount++;
      keyStat.errorCount = Math.max(0, keyStat.errorCount - 1); // Giảm error count khi thành công
    } else {
      keyStat.errorCount++;
      keyStat.lastError = error;
      
      // Kiểm tra các loại lỗi khác nhau
      if (error && error.includes('429')) {
        keyStat.quotaExceeded = true;
        keyStat.rateLimitReset = Date.now() + 3600000; // Reset sau 1 giờ
        logger.warn('API_KEY_MANAGER', `API key ${keyId} quota exceeded, will retry after 1 hour`, {
          error,
          resetTime: new Date(keyStat.rateLimitReset).toLocaleString()
        });
      } else if (error && error.includes('503')) {
        // For 503 errors, don't mark as quota exceeded, just increment error count
        logger.warn('API_KEY_MANAGER', `API key ${keyId} server overloaded (503), will retry later`, { error });
      } else if (keyStat.errorCount >= this.rateLimitConfig.errorThreshold) {
        keyStat.isActive = false;
        logger.warn('API_KEY_MANAGER', `API key ${keyId} temporarily disabled due to too many errors`, {
          errorCount: keyStat.errorCount,
          threshold: this.rateLimitConfig.errorThreshold
        });
        
        // Tự động kích hoạt lại sau 5 phút
        setTimeout(() => {
          keyStat.isActive = true;
          keyStat.errorCount = Math.floor(keyStat.errorCount / 2); // Giảm một nửa error count
          logger.info('API_KEY_MANAGER', `API key ${keyId} re-enabled`, {
            newErrorCount: keyStat.errorCount
          });
        }, 300000);
      }
    }

    logger.debug('API_KEY_MANAGER', `Key ${keyId} stats updated`, {
      requests: keyStat.requestsCount,
      errors: keyStat.errorCount,
      active: keyStat.isActive,
      quotaExceeded: keyStat.quotaExceeded
    });
  }

  /**
   * Kiểm tra rate limit cho một key
   */
  checkRateLimit(keyId) {
    const keyStat = this.keyStats.find(stat => stat.id === keyId);
    if (!keyStat) return false;

    const now = Date.now();
    const timeSinceLastUse = now - keyStat.lastUsed;

    // Kiểm tra quota exceeded
    if (keyStat.quotaExceeded && now < keyStat.rateLimitReset) {
      return false;
    }

    // Kiểm tra cooldown period
    if (timeSinceLastUse < this.rateLimitConfig.cooldownPeriod) {
      return false;
    }

    return true;
  }

  /**
   * Lấy thống kê tổng quan
   */
  getStats() {
    const totalRequests = this.keyStats.reduce((sum, stat) => sum + stat.requestsCount, 0);
    const activeKeys = this.keyStats.filter(stat => stat.isActive).length;
    const quotaExceededKeys = this.keyStats.filter(stat => stat.quotaExceeded).length;
    const errorKeys = this.keyStats.filter(stat => stat.errorCount > 0).length;

    return {
      totalKeys: this.apiKeys.length,
      activeKeys,
      quotaExceededKeys,
      errorKeys,
      totalRequests,
      averageRequestsPerKey: totalRequests / this.apiKeys.length,
      keyDetails: this.keyStats.map(stat => ({
        id: stat.id,
        requests: stat.requestsCount,
        errors: stat.errorCount,
        isActive: stat.isActive,
        quotaExceeded: stat.quotaExceeded,
        lastUsed: new Date(stat.lastUsed).toLocaleString()
      }))
    };
  }

  /**
   * Thêm request vào queue để xử lý tuần tự
   */
  async queueRequest(requestFunction) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        requestFunction,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  /**
   * Xử lý queue requests với retry logic
   */
  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const { requestFunction, resolve, reject } = this.requestQueue.shift();
      
      try {
        const result = await this.executeWithRetry(requestFunction);
        resolve(result);
        
        // Delay nhỏ giữa các requests để tránh rate limit
        await this.delay(100);
      } catch (error) {
        reject(error);
      }
    }

    this.isProcessingQueue = false;
  }

  /**
   * Execute request với retry logic cho 503 errors
   */
  async executeWithRetry(requestFunction, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFunction();
      } catch (error) {
        lastError = error;
        
        // Chỉ retry cho 503 Service Unavailable
        if (error.status === 503 || (error.message && error.message.includes('503'))) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
          logger.warn('API_KEY_MANAGER', `503 error on attempt ${attempt + 1}, retrying in ${delay}ms`, {
            attempt: attempt + 1,
            maxRetries,
            delay,
            error: error.message
          });
          await this.delay(delay);
          continue;
        }
        
        // Không retry cho các lỗi khác
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * Delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Lấy API key với retry logic
   */
  async getApiKeyWithRetry(maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const keyStat = this.getNextApiKey();
      
      if (this.checkRateLimit(keyStat.id)) {
        return keyStat;
      }

      logger.debug('API_KEY_MANAGER', `Attempt ${attempt + 1}: Key ${keyStat.id} not available, trying next...`, {
        attempt: attempt + 1,
        maxRetries,
        keyId: keyStat.id,
        isActive: keyStat.isActive,
        quotaExceeded: keyStat.quotaExceeded
      });
      
      if (attempt < maxRetries - 1) {
        await this.delay(1000); // Wait 1 second before retry
      }
    }

    logger.error('API_KEY_MANAGER', 'No available API keys after retries', {
      maxRetries,
      totalKeys: this.apiKeys.length,
      activeKeys: this.keyStats.filter(k => k.isActive).length
    });
    throw new Error('No available API keys after retries');
  }

  /**
   * Cleanup expired quotas (chạy định kỳ)
   */
  cleanupExpiredQuotas() {
    const now = Date.now();
    this.keyStats.forEach(stat => {
      if (stat.quotaExceeded && now >= stat.rateLimitReset) {
        stat.quotaExceeded = false;
        stat.rateLimitReset = 0;
        logger.info('API_KEY_MANAGER', `API key ${stat.id} quota reset`);
      }
    });
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval() {
    // Cleanup mỗi 5 phút
    setInterval(() => {
      this.cleanupExpiredQuotas();
    }, 300000);

    logger.info('API_KEY_MANAGER', 'API Key Manager cleanup interval started');
  }
}

// Singleton pattern để tránh duplicate initialization
let apiKeyManagerInstance = null;

export const getApiKeyManager = () => {
  if (!apiKeyManagerInstance) {
    apiKeyManagerInstance = new ApiKeyManager();
    apiKeyManagerInstance.startCleanupInterval();
    logger.info('API_KEY_MANAGER', 'API Key Manager singleton created');
  }
  return apiKeyManagerInstance;
};

// Export singleton instance
export const apiKeyManager = getApiKeyManager();
export default apiKeyManager;
