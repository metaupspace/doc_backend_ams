export function pick(obj, keys) {
  const result = {};
  keys.forEach((k) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, k)) {
      result[k] = obj[k];
    }
  });
  return result;
}
