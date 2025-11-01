// Not found middleware
export const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error (in production, should use proper logging service)
  if (process.env.NODE_ENV === 'production') {
    console.error('Error:', {
      message: err.message,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      // Don't log stack trace in production logs (security)
    });
  } else {
    console.error('Error:', err);
  }
  
  res.status(statusCode);
  res.json({
    success: false,
    message: err.message || 'Internal server error',
    // Never expose stack trace in production
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err,
    }),
  });
};

