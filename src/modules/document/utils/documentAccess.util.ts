const normalizeRoles = (roles = []) => roles.map((r) => String(r).toUpperCase());

export const canCreateDocument = (documentType, roles, { isPerformanceReport }) => {
  const normalized = normalizeRoles(roles);

  if (isPerformanceReport(documentType)) {
    return normalized.includes('MANAGER');
  }

  return normalized.includes('HR');
};

export const buildRoleContext = (requesterRoles = []) => {
  const roles = normalizeRoles(requesterRoles);
  return {
    isHR: roles.includes('HR'),
    isManager: roles.includes('MANAGER'),
    isEmployee: roles.includes('EMPLOYEE'),
  };
};

export const canReadDocuments = (roles) => {
  const normalized = normalizeRoles(roles);
  return normalized.some((role) => ['EMPLOYEE', 'HR', 'MANAGER'].includes(role));
};
