/**
 * Rate Limiting Middleware
 * Limits the number of requests per IP address per time window
 */

// Store request counts per IP
const requestCounts = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > 0) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.max - Maximum requests per window (default: 30)
 * @param {string} options.message - Error message (default: 'Too many requests')
 */
export const rateLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute default
    max = 30, // 30 requests per minute default
    message = 'Quá nhiều yêu cầu, vui lòng thử lại sau'
  } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Get or create request data for this IP
    let requestData = requestCounts.get(ip);
    
    if (!requestData || now > requestData.resetTime) {
      // Create new window
      requestData = {
        count: 1,
        resetTime: now + windowMs
      };
      requestCounts.set(ip, requestData);
      return next();
    }
    
    // Increment count
    requestData.count++;
    
    // Check if limit exceeded
    if (requestData.count > max) {
      const retryAfter = Math.ceil((requestData.resetTime - now) / 1000);
      
      return res.status(429).json({
        success: false,
        message,
        retryAfter,
        limit: max,
        windowMs
      });
    }
    
    // Update request data
    requestCounts.set(ip, requestData);
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requestData.count));
    res.setHeader('X-RateLimit-Reset', new Date(requestData.resetTime).toISOString());
    
    next();
  };
};

/**
 * Strict rate limiter for AI endpoints (more restrictive)
 */
export const aiRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute for AI endpoints
  message: 'Quá nhiều yêu cầu AI, vui lòng đợi một chút'
});

/**
 * Normal rate limiter for regular endpoints
 */
export const normalRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for regular endpoints
  message: 'Quá nhiều yêu cầu, vui lòng thử lại sau'
});

export default rateLimiter;

