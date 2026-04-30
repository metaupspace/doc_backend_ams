export const PERFORMANCE_REPORT_APPROVAL_STATUSES = [
  'draft',
  'submitted_to_hr',
  'approved_by_hr',
  'rejected_by_hr',
  'sent_to_employee',
  'acknowledged_by_employee',
] as const;

export const FINAL_PERFORMANCE_REPORT_STATUS = 'acknowledged_by_employee';

export const PERFORMANCE_REPORT_STATUS_TRANSITIONS = {
  submitToHr: {
    from: ['draft', 'rejected_by_hr'],
    to: 'submitted_to_hr',
  },
  approveByHr: {
    from: ['submitted_to_hr'],
    to: 'approved_by_hr',
  },
  rejectByHr: {
    from: ['submitted_to_hr'],
    to: 'rejected_by_hr',
  },
  sendToEmployee: {
    from: ['approved_by_hr'],
    to: 'sent_to_employee',
  },
  acknowledgeByEmployee: {
    from: ['sent_to_employee'],
    to: FINAL_PERFORMANCE_REPORT_STATUS,
  },
} as const;
