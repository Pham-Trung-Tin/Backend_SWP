export const sendResponse = (res, statusCode, success, message, data = null) => {
    return res.status(statusCode).json({
        success,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

export const sendSuccess = (res, message, data = null, statusCode = 200) => {
    return sendResponse(res, statusCode, true, message, data);
};

export const sendError = (res, message, statusCode = 400, data = null) => {
    return sendResponse(res, statusCode, false, message, data);
};

export const sendValidationError = (res, errors) => {
    return sendResponse(res, 422, false, 'Validation failed', { errors });
};
