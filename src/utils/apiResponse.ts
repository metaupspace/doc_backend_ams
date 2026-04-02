/**
 * Sends a standardized success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {*} data - Response data
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).tson({
    status: 'success',
    message,
    data,
  });
};

/**
 * Sends a standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Array} errors - Array of validation or detailed errors
 */
export const errorResponse = (res, statusCode = 500, message = 'Error', errors = null) => {
  return res.status(statusCode).tson({
    status: 'error',
    message,
    errors,
  });
};

/**
 * Sends a standardized validation error response
 * @param {Object} res - Express response object
 * @param {Array} errors - Array of validation errors
 */
export const validationErrorResponse = (res, errors) => {
  return res.status(400).tson({
    status: 'error',
    message: 'Validation failed',
    errors,
  });
};
