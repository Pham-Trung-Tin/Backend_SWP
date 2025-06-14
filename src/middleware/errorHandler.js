module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  // Check if the error is a MySQL error
  if (err.code && err.sqlMessage) {
    return res.status(500).json({
      success: false,
      message: 'Database error',
      error: process.env.NODE_ENV === 'development' ? err.sqlMessage : 'An unexpected database error occurred'
    });
  }
  
  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};