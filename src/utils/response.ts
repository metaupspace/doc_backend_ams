export function success(res, data = null, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', message, data });
}

export function error(res, message = 'Error', statusCode = 500) {
  return res.status(statusCode).json({ status: 'error', message });
}
