import * as documentRepository from '../repositories/document.repository.ts';
import { validateDocumentRequest } from '../validators/document.validation.ts';
import { buildRoleContext } from '../utils/documentAccess.util.ts';
import {
  applyEmployeeAcknowledgementOnPerformanceReportPayload,
  applyHrReviewOnPerformanceReportPayload,
  applyManagerReviewOnPerformanceReportPayload,
  formatAcknowledgementTimestamp,
  stripHrAndEmployeeAcknowledgementSignaturesFromPayload,
} from '../utils/performanceReportAcknowledgement.util.ts';
import {
  FINAL_PERFORMANCE_REPORT_STATUS,
  PERFORMANCE_REPORT_STATUS_TRANSITIONS,
} from '../config/performanceReportApproval.config.ts';
import { safeObjectIdError } from '../utils/documentError.util.ts';

const loadPerformanceReportOrThrow = async (id) => {
  let documentRecord;
  try {
    documentRecord = await documentRepository.findDocumentById(id);
  } catch (_error) {
    throw safeObjectIdError('Invalid performance report id');
  }

  if (!documentRecord || documentRecord.documentType !== 'performance-report') {
    const err = new Error('Performance report not found');
    err.statusCode = 404;
    throw err;
  }

  return documentRecord;
};

const ensureNotLocked = (documentRecord) => {
  if (documentRecord.approvalStatus === FINAL_PERFORMANCE_REPORT_STATUS) {
    const err = new Error('Performance report is locked after employee acknowledgement');
    err.statusCode = 409;
    throw err;
  }
};

const ensureAllowedStatus = (documentRecord, allowedStatuses, actionLabel) => {
  if (!allowedStatuses.includes(documentRecord.approvalStatus)) {
    const err = new Error(
      `Cannot ${actionLabel} when approvalStatus is ${documentRecord.approvalStatus || 'unknown'}`
    );
    err.statusCode = 409;
    throw err;
  }
};

const resolveActorName = (fallback, preferred) => {
  const byPreferred = typeof preferred === 'string' ? preferred.trim() : '';
  if (byPreferred) return byPreferred;

  const byFallback = typeof fallback === 'string' ? fallback.trim() : '';
  return byFallback || null;
};

const appendApprovalStatusHistory = ({ documentRecord, status, changedById, changedByName, remarks }) => {
  if (!Array.isArray(documentRecord.approvalStatusHistory)) {
    documentRecord.approvalStatusHistory = [];
  }

  documentRecord.approvalStatusHistory.push({
    status,
    changedAt: new Date(),
    changedById: changedById || null,
    changedByName: changedByName || null,
    remarks: remarks || null,
  });
};

const isRequesterEmployeeOwner = (requester, documentEmployeeId) => {
  const normalizedDocumentEmployeeId =
    typeof documentEmployeeId === 'string' ? documentEmployeeId.trim().toLowerCase() : '';
  if (!normalizedDocumentEmployeeId) {
    return false;
  }

  const candidateIds = [
    requester?.employeeId,
    requester?.id,
    requester?.userId,
    requester?.sub,
    requester?.employeeCode,
  ]
    .map((value) => (typeof value === 'string' ? value.trim().toLowerCase() : ''))
    .filter(Boolean);

  return candidateIds.includes(normalizedDocumentEmployeeId);
};

const resolveRequesterWithEmployeeId = async (requester) => {
  if (requester?.employeeId) {
    return requester;
  }

  const emailCandidates = [
    requester?.email,
    requester?.id,
    requester?.userId,
    requester?.sub,
  ]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter((value) => value && value.includes('@'));

  for (const email of emailCandidates) {
    const employeeRecord = await documentRepository.findActiveEmployeeByEmail(email);
    if (employeeRecord?.employeeId) {
      return {
        ...requester,
        employeeId: employeeRecord.employeeId,
      };
    }
  }

  return requester;
};

export const updateDraftPerformanceReport = async ({ id, requester, payload }) => {
  const roleCtx = buildRoleContext(requester?.roles || []);
  if (!roleCtx.isManager) {
    const err = new Error('Only MANAGER can edit performance report draft');
    err.statusCode = 403;
    throw err;
  }

  const { error, value } = validateDocumentRequest('performance-report', { payload });
  if (error) {
    const err = new Error(error.details?.[0]?.message || 'Invalid performance report payload');
    err.statusCode = 400;
    throw err;
  }

  const documentRecord = await loadPerformanceReportOrThrow(id);
  ensureNotLocked(documentRecord);

  ensureAllowedStatus(
    documentRecord,
    [...PERFORMANCE_REPORT_STATUS_TRANSITIONS.submitToHr.from, 'draft'],
    'edit draft'
  );

  const sanitizedDraftPayload = stripHrAndEmployeeAcknowledgementSignaturesFromPayload({
    payload: value.payload,
  });
  const managerNormalizedPayload = applyManagerReviewOnPerformanceReportPayload({
    payload: sanitizedDraftPayload,
    reviewerName: sanitizedDraftPayload?.reviewerName,
    reviewedAt: new Date(),
  });

  documentRecord.payload = managerNormalizedPayload;
  documentRecord.employeeName = managerNormalizedPayload?.employeeName || documentRecord.employeeName;
  documentRecord.approvalStatus = 'draft';

  appendApprovalStatusHistory({
    documentRecord,
    status: 'draft',
    changedById: requester?.id,
    changedByName: managerNormalizedPayload?.reviewerName || requester?.email || null,
    remarks: 'Draft updated by manager',
  });

  await documentRepository.saveDocument(documentRecord);

  return documentRecord;
};

export const submitPerformanceReportToHr = async ({ id, requester }) => {
  const roleCtx = buildRoleContext(requester?.roles || []);
  if (!roleCtx.isManager) {
    const err = new Error('Only MANAGER can submit performance report to HR');
    err.statusCode = 403;
    throw err;
  }

  const documentRecord = await loadPerformanceReportOrThrow(id);
  ensureNotLocked(documentRecord);
  ensureAllowedStatus(
    documentRecord,
    [...PERFORMANCE_REPORT_STATUS_TRANSITIONS.submitToHr.from],
    'submit to HR'
  );

  const submittedAt = new Date();
  documentRecord.approvalStatus = PERFORMANCE_REPORT_STATUS_TRANSITIONS.submitToHr.to;
  documentRecord.submittedToHrAt = submittedAt;
  documentRecord.submittedToHrById = requester?.id || null;
  appendApprovalStatusHistory({
    documentRecord,
    status: PERFORMANCE_REPORT_STATUS_TRANSITIONS.submitToHr.to,
    changedById: requester?.id,
    changedByName: requester?.email || null,
    remarks: 'Submitted to HR by manager',
  });

  await documentRepository.saveDocument(documentRecord);

  return documentRecord;
};

export const reviewPerformanceReportByHr = async ({
  id,
  requester,
  decision,
  hrName,
  remarks,
}) => {
  const roleCtx = buildRoleContext(requester?.roles || []);
  if (!roleCtx.isHR) {
    const err = new Error('Only HR can review performance report');
    err.statusCode = 403;
    throw err;
  }

  const normalizedDecision = String(decision || '').trim().toLowerCase();
  if (!['approve', 'reject'].includes(normalizedDecision)) {
    const err = new Error('decision must be either approve or reject');
    err.statusCode = 400;
    throw err;
  }

  const documentRecord = await loadPerformanceReportOrThrow(id);
  ensureNotLocked(documentRecord);
  ensureAllowedStatus(documentRecord, [...PERFORMANCE_REPORT_STATUS_TRANSITIONS.approveByHr.from], 'review by HR');

  const reviewedAt = new Date();
  const resolvedHrName = resolveActorName(documentRecord.hrName, hrName);

  documentRecord.hrId = requester?.id || documentRecord.hrId;
  documentRecord.hrName = resolvedHrName || documentRecord.hrName;
  documentRecord.hrReviewRemarks = remarks || null;
  documentRecord.hrReviewedAt = reviewedAt;
  documentRecord.hrReviewedById = requester?.id || null;
  documentRecord.hrReviewedByName = resolvedHrName;

  if (normalizedDecision === 'reject') {
    documentRecord.approvalStatus = PERFORMANCE_REPORT_STATUS_TRANSITIONS.rejectByHr.to;
    appendApprovalStatusHistory({
      documentRecord,
      status: PERFORMANCE_REPORT_STATUS_TRANSITIONS.rejectByHr.to,
      changedById: requester?.id,
      changedByName: resolvedHrName || requester?.email || null,
      remarks: remarks || 'Rejected by HR',
    });
    await documentRepository.saveDocument(documentRecord);
    return documentRecord;
  }

  documentRecord.hrSignatureUrl = null;
  documentRecord.payload = applyHrReviewOnPerformanceReportPayload({
    payload: documentRecord.payload,
    hrName: resolvedHrName || documentRecord.hrName || 'HR',
    reviewedAt,
  });
  documentRecord.approvalStatus = PERFORMANCE_REPORT_STATUS_TRANSITIONS.approveByHr.to;
  appendApprovalStatusHistory({
    documentRecord,
    status: PERFORMANCE_REPORT_STATUS_TRANSITIONS.approveByHr.to,
    changedById: requester?.id,
    changedByName: resolvedHrName || requester?.email || null,
    remarks: remarks || 'Approved by HR',
  });

  await documentRepository.saveDocument(documentRecord);

  return documentRecord;
};

export const sendPerformanceReportToEmployee = async ({ id, requester }) => {
  const roleCtx = buildRoleContext(requester?.roles || []);
  if (!roleCtx.isHR) {
    const err = new Error('Only HR can send performance report to employee');
    err.statusCode = 403;
    throw err;
  }

  const documentRecord = await loadPerformanceReportOrThrow(id);
  ensureNotLocked(documentRecord);
  ensureAllowedStatus(
    documentRecord,
    [...PERFORMANCE_REPORT_STATUS_TRANSITIONS.sendToEmployee.from],
    'send to employee'
  );

  const sentAt = new Date();
  documentRecord.approvalStatus = PERFORMANCE_REPORT_STATUS_TRANSITIONS.sendToEmployee.to;
  documentRecord.sentToEmployeeAt = sentAt;
  documentRecord.sentToEmployeeById = requester?.id || null;
  appendApprovalStatusHistory({
    documentRecord,
    status: PERFORMANCE_REPORT_STATUS_TRANSITIONS.sendToEmployee.to,
    changedById: requester?.id,
    changedByName: requester?.email || null,
    remarks: 'Sent to employee by HR',
  });

  await documentRepository.saveDocument(documentRecord);

  return documentRecord;
};

export const acknowledgePerformanceReportByEmployee = async ({ id, requester, employeeName }) => {
  const resolvedRequester = await resolveRequesterWithEmployeeId(requester);
  const roleCtx = buildRoleContext(resolvedRequester?.roles || []);
  if (!roleCtx.isEmployee) {
    const err = new Error('Only EMPLOYEE can acknowledge performance report');
    err.statusCode = 403;
    throw err;
  }

  const documentRecord = await loadPerformanceReportOrThrow(id);
  ensureNotLocked(documentRecord);

  if (!isRequesterEmployeeOwner(resolvedRequester, documentRecord.employeeId)) {
    const err = new Error('Employees can acknowledge only their own performance report');
    err.statusCode = 403;
    throw err;
  }

  ensureAllowedStatus(
    documentRecord,
    [...PERFORMANCE_REPORT_STATUS_TRANSITIONS.acknowledgeByEmployee.from],
    'acknowledge performance report'
  );

  const acknowledgedAt = new Date();
  const finalEmployeeName =
    resolveActorName(documentRecord.employeeName, employeeName) || documentRecord.employeeId;

  documentRecord.payload = applyEmployeeAcknowledgementOnPerformanceReportPayload({
    payload: documentRecord.payload,
    employeeName: finalEmployeeName,
    acknowledgedAt,
  });

  documentRecord.approvalStatus = PERFORMANCE_REPORT_STATUS_TRANSITIONS.acknowledgeByEmployee.to;
  documentRecord.employeeAcknowledgedAt = acknowledgedAt;
  documentRecord.employeeAcknowledgedById = resolvedRequester?.id || null;
  documentRecord.employeeAcknowledgedByName = finalEmployeeName;
  documentRecord.employeeAcknowledgementSignatureText =
    `${finalEmployeeName} | ${formatAcknowledgementTimestamp(acknowledgedAt)}`;
  documentRecord.lockedAt = acknowledgedAt;
  appendApprovalStatusHistory({
    documentRecord,
    status: PERFORMANCE_REPORT_STATUS_TRANSITIONS.acknowledgeByEmployee.to,
    changedById: resolvedRequester?.id,
    changedByName: finalEmployeeName,
    remarks: 'Acknowledged by employee and locked',
  });

  await documentRepository.saveDocument(documentRecord);

  return documentRecord;
};
