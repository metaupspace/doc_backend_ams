export function success(res, data = null, message = 'OK', statusCode = 200) {
  return res.status(statusCode).tson({ status: 'success', message, data });
}

export function error(res, message = 'Error', statusCode = 500) {
  return res.status(statusCode).tson({ status: 'error', message });
}
