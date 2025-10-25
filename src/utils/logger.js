/**
 * Centralized Logging Utility
 * Provides structured logging with levels and environment control
 */

class Logger {
  constructor() {
    // Log levels
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4
    };

    // Current log level (can be set via environment or localStorage)
    this.currentLevel = this.getLogLevel();
    
    // Colors for console output
    this.colors = {
      ERROR: '#ff4444',
      WARN: '#ffaa00',
      INFO: '#4488ff',
      DEBUG: '#44ff44',
      TRACE: '#888888'
    };

    // Module prefixes for better organization
    this.modules = {
      API_KEY_MANAGER: '🔑 API Manager',
      READING_TIPS: '📚 Reading Tips',
      LEARNING_PANEL: '🎓 Learning Panel',
      GEMINI_SERVICE: '🤖 Gemini',
      READING_MODE: '📖 Reading Mode',
      GENERAL: '📝 General'
    };
  }

  /**
   * Get log level from environment or localStorage
   */
  getLogLevel() {
    // Check localStorage first
    const storedLevel = localStorage.getItem('smartread_log_level');
    if (storedLevel !== null) {
      return parseInt(storedLevel);
    }

    // Check environment
    if (import.meta.env.DEV) {
      return this.levels.DEBUG; // Debug level in development
    }
    
    return this.levels.INFO; // Info level in production
  }

  /**
   * Set log level dynamically
   */
  setLogLevel(level) {
    if (typeof level === 'string') {
      level = this.levels[level.toUpperCase()];
    }
    
    if (level !== undefined && level >= 0 && level <= 4) {
      this.currentLevel = level;
      localStorage.setItem('smartread_log_level', level.toString());
      this.info('Logger', `Log level set to ${Object.keys(this.levels)[level]}`);
    }
  }

  /**
   * Check if should log at given level
   */
  shouldLog(level) {
    return level <= this.currentLevel;
  }

  /**
   * Format log message with timestamp and module
   */
  formatMessage(level, module, message, data = null) {
    const timestamp = new Date().toLocaleTimeString('vi-VN');
    const levelName = Object.keys(this.levels)[level];
    const moduleName = this.modules[module] || module;
    
    return {
      timestamp,
      level: levelName,
      module: moduleName,
      message,
      data
    };
  }

  /**
   * Log with styling
   */
  log(level, module, message, data = null) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, module, message, data);
    const color = this.colors[formatted.level];
    
    // Console output with styling
    const style = `color: ${color}; font-weight: bold;`;
    const prefix = `[${formatted.timestamp}] ${formatted.level} ${formatted.module}:`;
    
    if (data !== null) {
      console.log(`%c${prefix} ${formatted.message}`, style, data);
    } else {
      console.log(`%c${prefix} ${formatted.message}`, style);
    }

    // Store in memory for debugging (optional)
    this.storeLog(formatted);
  }

  /**
   * Store logs in memory for debugging
   */
  storeLog(logEntry) {
    if (!this.logs) {
      this.logs = [];
    }
    
    this.logs.push(logEntry);
    
    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }
  }

  /**
   * Get stored logs
   */
  getLogs() {
    return this.logs || [];
  }

  /**
   * Clear stored logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  // Convenience methods
  error(module, message, data = null) {
    this.log(this.levels.ERROR, module, message, data);
  }

  warn(module, message, data = null) {
    this.log(this.levels.WARN, module, message, data);
  }

  info(module, message, data = null) {
    this.log(this.levels.INFO, module, message, data);
  }

  debug(module, message, data = null) {
    this.log(this.levels.DEBUG, module, message, data);
  }

  trace(module, message, data = null) {
    this.log(this.levels.TRACE, module, message, data);
  }

  // API specific logging methods
  apiCall(module, method, url, data = null) {
    this.debug(module, `API Call: ${method} ${url}`, data);
  }

  apiSuccess(module, method, url, response = null) {
    this.info(module, `API Success: ${method} ${url}`, response);
  }

  apiError(module, method, url, error = null) {
    this.error(module, `API Error: ${method} ${url}`, error);
  }

  // Performance logging
  performance(module, operation, duration, data = null) {
    this.info(module, `Performance: ${operation} took ${duration}ms`, data);
  }

  // User action logging
  userAction(module, action, data = null) {
    this.info(module, `User Action: ${action}`, data);
  }

  // State change logging
  stateChange(module, stateName, oldValue, newValue) {
    this.debug(module, `State Change: ${stateName}`, { oldValue, newValue });
  }
}

// Create singleton instance
const logger = new Logger();

// Export for use in components and services
export default logger;

// Export class for advanced usage
export { Logger };

// Global access for debugging (only in development)
if (import.meta.env.DEV) {
  window.smartreadLogger = logger;
  window.setLogLevel = (level) => logger.setLogLevel(level);
  window.getLogs = () => logger.getLogs();
  window.clearLogs = () => logger.clearLogs();
  window.exportLogs = () => logger.exportLogs();
  
  // Log available commands
  logger.info('Logger', 'SmartRead Logger initialized. Available commands:');
  logger.info('Logger', '- setLogLevel(0-4): ERROR, WARN, INFO, DEBUG, TRACE');
  logger.info('Logger', '- getLogs(): Get stored logs');
  logger.info('Logger', '- clearLogs(): Clear stored logs');
  logger.info('Logger', '- exportLogs(): Export logs as JSON');
}
