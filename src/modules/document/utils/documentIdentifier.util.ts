const slugifyValue = (value, fallback = 'na') => {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
};

const formatCreationDate = (value) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return 'unknown-date';
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const buildDocumentIdentifier = ({ documentType, employeeName, createdAt }) => {
  const docName = slugifyValue(documentType, 'document');
  const empName = slugifyValue(employeeName, 'employee');
  const createdDate = formatCreationDate(createdAt);
  return `${docName}-${empName}-${createdDate}`;
};
