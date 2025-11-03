/**
 * Gemini API Key Pool Manager
 * Manages multiple API keys with round-robin load balancing
 * Tracks usage and health status for each key
 */

class GeminiPoolManager {
  constructor() {
    this.keys = [];
    this.currentIndex = 0;
    this.usageCount = {}; // Track usage per key
    this.errorCount = {}; // Track errors per key
    this.lastUsed = {}; // Track last used time per key
    this.rateLimitStatus = {}; // Track rate limit status per key
    this.initialized = false;
  }

  /**
   * Initialize the pool with API keys from environment
   */
  initialize() {
    if (this.initialized) return;

    // Get keys from environment
    const combined = process.env.GEMINI_API_KEYS || '';
    let keys = combined
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    // Fallback to numbered vars if provided
    if (keys.length === 0) {
      keys = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
      ].filter(Boolean);
    }

    if (keys.length === 0) {
      throw new Error('No Gemini API keys configured');
    }

    this.keys = keys;
    
    // Initialize tracking
    this.keys.forEach(key => {
      this.usageCount[key] = 0;
      this.errorCount[key] = 0;
      this.lastUsed[key] = null;
      this.rateLimitStatus[key] = {
        isLimited: false,
        limitedUntil: null,
        retryAfter: null
      };
    });

    this.initialized = true;
    console.log(`✅ Gemini Pool Manager initialized with ${this.keys.length} keys`);
  }

  /**
   * Get the next available key using round-robin
   * Skips rate-limited keys
   */
  getNextKey() {
    if (!this.initialized) this.initialize();
    if (this.keys.length === 0) throw new Error('No API keys available');

    const healthyKeys = this.getHealthyKeys();
    if (healthyKeys.length === 0) {
      // If all keys are rate-limited, use them anyway (will retry)
      return this.keys[this.currentIndex % this.keys.length];
    }

    // Use round-robin on healthy keys
    const keyIndex = healthyKeys.indexOf(this.keys[this.currentIndex]);
    const nextKey = healthyKeys[keyIndex >= 0 ? keyIndex : 0];
    
    // Move to next key for next request
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    
    return nextKey;
  }

  /**
   * Get all healthy (non-rate-limited) keys
   */
  getHealthyKeys() {
    if (!this.initialized) this.initialize();
    
    return this.keys.filter(key => {
      const status = this.rateLimitStatus[key];
      if (!status.isLimited) return true;
      
      // Check if rate limit has expired
      if (status.limitedUntil && new Date() > new Date(status.limitedUntil)) {
        status.isLimited = false;
        status.limitedUntil = null;
        status.retryAfter = null;
        return true;
      }
      
      return false;
    });
  }

  /**
   * Mark a key as rate-limited
   */
  markRateLimited(key, retryAfterSeconds = 60) {
    if (!this.initialized) this.initialize();
    if (!this.keys.includes(key)) return;
    
    const retryAfter = retryAfterSeconds * 1000; // Convert to milliseconds
    this.rateLimitStatus[key] = {
      isLimited: true,
      limitedUntil: new Date(Date.now() + retryAfter),
      retryAfter: retryAfterSeconds
    };
    
    this.errorCount[key] = (this.errorCount[key] || 0) + 1;
    console.warn(`⚠️  Key ${this.getKeyMask(key)} marked as rate-limited. Retry after ${retryAfterSeconds}s`);
  }

  /**
   * Record successful usage of a key
   */
  recordSuccess(key) {
    if (!this.initialized) this.initialize();
    if (!this.keys.includes(key)) return;
    
    this.usageCount[key] = (this.usageCount[key] || 0) + 1;
    this.lastUsed[key] = new Date();
    this.errorCount[key] = 0; // Reset error count on success
    
    // Clear rate limit if it was previously set
    if (this.rateLimitStatus[key]?.isLimited) {
      this.rateLimitStatus[key].isLimited = false;
      this.rateLimitStatus[key].limitedUntil = null;
    }
  }

  /**
   * Record error for a key
   */
  recordError(key, error) {
    if (!this.initialized) this.initialize();
    if (!this.keys.includes(key)) return;
    
    this.errorCount[key] = (this.errorCount[key] || 0) + 1;
    
    // Check if error is rate limit related
    const errorMessage = error?.message || error?.toString() || '';
    if (errorMessage.includes('429') || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      this.markRateLimited(key, 60); // Rate limit for 60 seconds
    }
  }

  /**
   * Get masked key for logging (security)
   */
  getKeyMask(key) {
    if (!key || key.length < 10) return '****';
    return key.substring(0, 10) + '...' + key.substring(key.length - 4);
  }

  /**
   * Get pool statistics
   */
  getStats() {
    // Lazy initialization - only init if not already done
    if (!this.initialized) {
      try {
        this.initialize();
      } catch (error) {
        // If initialization fails (no keys), return empty stats
        return {
          totalKeys: 0,
          healthyKeys: 0,
          rateLimitedKeys: 0,
          error: error.message,
          usage: []
        };
      }
    }
    
    return {
      totalKeys: this.keys.length,
      healthyKeys: this.getHealthyKeys().length,
      rateLimitedKeys: this.keys.length - this.getHealthyKeys().length,
      usage: this.keys.map(key => ({
        key: this.getKeyMask(key),
        usageCount: this.usageCount[key] || 0,
        errorCount: this.errorCount[key] || 0,
        lastUsed: this.lastUsed[key],
        isRateLimited: this.rateLimitStatus[key]?.isLimited || false,
        limitedUntil: this.rateLimitStatus[key]?.limitedUntil || null
      }))
    };
  }

  /**
   * Reset all rate limits (for testing/recovery)
   */
  resetRateLimits() {
    if (!this.initialized) this.initialize();
    this.keys.forEach(key => {
      this.rateLimitStatus[key] = {
        isLimited: false,
        limitedUntil: null,
        retryAfter: null
      };
    });
    console.log('🔄 All rate limits reset');
  }
}

// Singleton instance
const geminiPoolManager = new GeminiPoolManager();

export default geminiPoolManager;

