export const formatResponse = (data, message = 'Success', status = 200) => {
  return {
    status,
    message,
    data,
  };
};

export const handleError = (error) => {
  console.error(error);
  return {
    status: 'error',
    message: error.message || 'An unexpected error occurred',
  };
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6; // Example validation: password must be at least 6 characters
};