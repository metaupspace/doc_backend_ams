import { Readable } from 'node:stream';
// import mongoose from 'mongoose';
import logger from '../../../config/logger.ts';
import { generatePDFBuffer } from '../generators/document.generator.ts';
import * as documentRepository from '../repositories/document.repository.ts';
import { isPerformanceReport, shouldSkipEmployeeExistenceCheck } from '../config/document.config.ts';
import { safeObjectIdError } from '../utils/documentError.util.ts';
import { buildDocumentIdentifier } from '../utils/documentIdentifier.util.ts';
import { buildRoleContext } from '../utils/documentAccess.util.ts';
import {
  applyManagerReviewOnPerformanceReportPayload,
  stripHrAndEmployeeAcknowledgementSignaturesFromPayload,
} from '../utils/performanceReportAcknowledgement.util.ts';

const EMPLOYEE_VISIBLE_EPR_STATUSES = ['sent_to_employee', 'acknowledged_by_employee'];
const HR_VISIBLE_EPR_STATUSES = [
  'submitted_to_hr',
  'approved_by_hr',
  'rejected_by_hr',
  'sent_to_employee',
  'acknowledged_by_employee',
];

const normalizeIdentifier = (value: unknown) =>
  typeof value === 'string' ? value.trim() : '';

const normalizeIdentifierKey = (value: unknown) => normalizeIdentifier(value).toLowerCase();

const getRequesterEmployeeIdentifiers = (requester) => {
  const identifiers = new Set<string>();

  const candidates = [
    requester?.employeeId,
    requester?.id,
    requester?.userId,
    requester?.sub,
    requester?.employeeCode,
  ];

  for (const candidate of candidates) {
    const value = normalizeIdentifier(candidate);
    if (value) identifiers.add(value);
  }

  return identifiers;
};

const buildEmployeeOwnerFilter = (requester) => {
  const identifierVariants = new Set<string>();

  for (const identifier of getRequesterEmployeeIdentifiers(requester)) {
    identifierVariants.add(identifier);
    identifierVariants.add(identifier.toLowerCase());
    identifierVariants.add(identifier.toUpperCase());
  }

  const identifiers = Array.from(identifierVariants);
  if (identifiers.length === 0) {
    return { employeeId: null };
  }

  if (identifiers.length === 1) {
    return { employeeId: identifiers[0] };
  }

  return { employeeId: { $in: identifiers } };
};

const isRequesterEmployeeOwner = (requester, documentEmployeeId) => {
  const documentKey = normalizeIdentifierKey(documentEmployeeId);
  if (!documentKey) {
    return false;
  }

  const requesterKeys = new Set(
    Array.from(getRequesterEmployeeIdentifiers(requester)).map((identifier) =>
      normalizeIdentifierKey(identifier)
    )
  );

  return requesterKeys.has(documentKey);
};

const resolveRequesterWithEmployeeId = async (requester) => {
  if (requester?.employeeId || !requester?.email) {
    return requester;
  }

  const employeeRecord = await documentRepository.findActiveEmployeeByEmail(requester.email);
  if (!employeeRecord?.employeeId) {
    return requester;
  }

  logger.info({
    message: 'Resolved requester employeeId from email for document access',
    userId: requester?.id || null,
    email: requester.email,
    employeeId: employeeRecord.employeeId,
  });

  return {
    ...requester,
    employeeId: employeeRecord.employeeId,
  };
};

const resolveEmployeeIdFromRequester = async (requester) => {
  if (requester?.employeeId) {
    return requester.employeeId;
  }

  const emailCandidates = [
    requester?.email,
    requester?.id,
    requester?.userId,
    requester?.sub,
  ]
    .map((value) => normalizeIdentifier(value))
    .filter((value) => value && value.includes('@'));

  for (const email of emailCandidates) {
    const employeeRecord = await documentRepository.findActiveEmployeeByEmail(email);
    if (employeeRecord?.employeeId) {
      logger.info({
        message: 'Resolved employeeId from requester email candidate',
        userId: requester?.id || null,
        emailCandidate: email,
        employeeId: employeeRecord.employeeId,
      });
      return employeeRecord.employeeId;
    }
  }

  return null;
};

export const createAndGenerateDocument = async ({
  documentType,
  payload,
  requester,
  requestMetadata,
}) => {
  const startTime = Date.now();
  let normalizedPayload = payload;
  const roleCtx = buildRoleContext(requester?.roles || []);
  const skipEmployeeCheck = shouldSkipEmployeeExistenceCheck(documentType);

  if (isPerformanceReport(documentType)) {
    normalizedPayload = stripHrAndEmployeeAcknowledgementSignaturesFromPayload({ payload });
    normalizedPayload = applyManagerReviewOnPerformanceReportPayload({
      payload: normalizedPayload,
      reviewerName: normalizedPayload?.reviewerName,
      reviewedAt: new Date(),
    });
  }

  const employeeId = normalizedPayload.employeeId || requester?.id || null;
  const hrId = normalizedPayload.hrId || (roleCtx.isHR ? requester?.id : null);
  const managerId = normalizedPayload.managerId || (roleCtx.isManager ? requester?.id : null);

  if (!skipEmployeeCheck && !employeeId) {
    const err = new Error('employeeId is required for document generation');
    err.statusCode = 400;
    throw err;
  }

  if (!skipEmployeeCheck) {
    const employee = await documentRepository.findActiveEmployeeByEmployeeId(employeeId);
    if (!employee) {
      const err = new Error(`Employee with employeeId ${employeeId} does not exist`);
      err.statusCode = 404;
      throw err;
    }
  }

  // if (documentType === 'joining-letter') {
  //   const offerLetterDocumentId = payload?.offerLetterDocumentId;

  //   if (offerLetterDocumentId && !mongoose.Types.ObjectId.isValid(String(offerLetterDocumentId))) {
  //     const err = new Error('offerLetterDocumentId is invalid');
  //     err.statusCode = 400;
  //     throw err;
  //   }

  //   const offerLetter = await documentRepository.findSuccessfulOfferLetterForEmployee({
  //     employeeId,
  //     offerLetterDocumentId,
  //   });

  //   if (!offerLetter) {
  //     const err = new Error(
  //       offerLetterDocumentId
  //         ? `Corresponding offer letter ${offerLetterDocumentId} not found for employee ${employeeId}`
  //         : `No corresponding offer letter found for employee ${employeeId}`
  //     );
  //     err.statusCode = 404;
  //     throw err;
  //   }
  // }

  const documentRecord = await documentRepository.createDocument({
    documentType,
    employeeId,
    employeeName: normalizedPayload?.employeeName || null,
    hrId,
    hrName: normalizedPayload?.hrName || null,
    managerId,
    payload: normalizedPayload,
    requestMetadata,
    status: 'processing',
    approvalStatus: isPerformanceReport(documentType) ? 'draft' : undefined,
    approvalStatusHistory: isPerformanceReport(documentType)
      ? [
          {
            status: 'draft',
            changedAt: new Date(),
            changedById: requester?.id || null,
            changedByName:
              normalizedPayload?.reviewerName || normalizedPayload?.employeeName || null,
            remarks: 'Performance report created',
          },
        ]
      : undefined,
  });

  try {
    const issuedAt = normalizedPayload?.issueDate || documentRecord.createdAt;
    const pdfBuffer = await generatePDFBuffer(documentType, normalizedPayload, {
      issuedAt,
    });
    const generationTime = Date.now() - startTime;
    const documentIdentifier = buildDocumentIdentifier({
      documentType,
      employeeName: normalizedPayload?.employeeName,
      createdAt: documentRecord.createdAt,
    });

    documentRecord.status = 'success';
    documentRecord.documentIdentifier = documentIdentifier;
    documentRecord.fileSize = pdfBuffer.length;
    documentRecord.fileName = `${documentIdentifier}.pdf`;
    documentRecord.generationTime = generationTime;

    await documentRepository.saveDocument(documentRecord);

    logger.info({
      message: 'Document generated and saved successfully',
      documentType,
      recordId: documentRecord._id,
      generationTime,
    });

    return {
      documentRecord,
      pdfStream: Readable.from(pdfBuffer),
    };
  } catch (error) {
    documentRecord.status = 'failure';
    documentRecord.errorMessage = error.message;
    await documentRepository.saveDocument(documentRecord);

    logger.error({
      message: 'Document generation failed',
      documentType,
      recordId: documentRecord._id,
      error: error.message,
    });

    throw error;
  }
};

export const getDocuments = async ({ requester, query }) => {
  const roleCtx = buildRoleContext(requester?.roles || []);
  const filters: Record<string, any> = {};
  const searchRaw = typeof query?.search === 'string' ? query.search.trim() : '';
  const search = searchRaw.slice(0, 100);

  if (query?.documentType) {
    filters.documentType = query.documentType;
  }

  if (query?.approvalStatus) {
    filters.approvalStatus = query.approvalStatus;
  }

  if (roleCtx.isEmployee && !roleCtx.isHR && !roleCtx.isManager) {
    Object.assign(filters, buildEmployeeOwnerFilter(requester));

    if (query?.documentType === 'performance-report') {
      if (!query?.approvalStatus) {
        filters.approvalStatus = { $in: EMPLOYEE_VISIBLE_EPR_STATUSES };
      } else if (!EMPLOYEE_VISIBLE_EPR_STATUSES.includes(String(query.approvalStatus))) {
        filters._id = null;
      }
    }

    if (!query?.documentType) {
      filters.$or = [
        { documentType: { $ne: 'performance-report' } },
        {
          documentType: 'performance-report',
          approvalStatus: { $in: EMPLOYEE_VISIBLE_EPR_STATUSES },
        },
      ];
    }
  }

  if (roleCtx.isHR && !roleCtx.isManager) {
    if (query?.documentType === 'performance-report') {
      if (!query?.approvalStatus) {
        filters.approvalStatus = { $in: HR_VISIBLE_EPR_STATUSES };
      } else if (!HR_VISIBLE_EPR_STATUSES.includes(String(query.approvalStatus))) {
        filters._id = null;
      }
    }

    if (!query?.documentType) {
      filters.$or = [
        { documentType: { $ne: 'performance-report' } },
        {
          documentType: 'performance-report',
          approvalStatus: { $in: HR_VISIBLE_EPR_STATUSES },
        },
      ];
    }
  }

  const parsedPage = Number.parseInt(String(query?.page || '1'), 10);
  const parsedLimit = Number.parseInt(String(query?.limit || '20'), 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);
  const limit = Number.isNaN(parsedLimit) ? 20 : Math.max(1, Math.min(parsedLimit, 100));
  return documentRepository.findDocuments({
    filters,
    search,
    page,
    limit,
  });
};

const getAccessibleDocumentById = async ({ id, requester }) => {
  const employeeId = await resolveEmployeeIdFromRequester(requester);
  const resolvedRequester =
    employeeId && !requester?.employeeId ? { ...requester, employeeId } : requester;

  let documentRecord;
  try {
    documentRecord = await documentRepository.findDocumentById(id);
  } catch (_error) {
    throw safeObjectIdError('Invalid document id');
  }

  if (!documentRecord) {
    const err = new Error('Document not found');
    err.statusCode = 404;
    throw err;
  }

  const roleCtx = buildRoleContext(resolvedRequester?.roles || []);
  const isOwner = isRequesterEmployeeOwner(resolvedRequester, documentRecord.employeeId);

  if (!roleCtx.isHR && !roleCtx.isManager && !(roleCtx.isEmployee && isOwner)) {
    const err = new Error('Insufficient permissions');
    err.statusCode = 403;
    throw err;
  }

  if (
    documentRecord.documentType === 'performance-report' &&
    roleCtx.isHR &&
    !roleCtx.isManager &&
    !HR_VISIBLE_EPR_STATUSES.includes(String(documentRecord.approvalStatus || ''))
  ) {
    const err = new Error(
      'Performance report is not yet submitted to HR. It becomes accessible after submitted_to_hr status.'
    );
    err.statusCode = 403;
    throw err;
  }

  if (
    documentRecord.documentType === 'performance-report' &&
    roleCtx.isEmployee &&
    !roleCtx.isHR &&
    !roleCtx.isManager &&
    isOwner &&
    !EMPLOYEE_VISIBLE_EPR_STATUSES.includes(String(documentRecord.approvalStatus || ''))
  ) {
    const err = new Error(
      'Performance report is not yet shared with employee. It becomes accessible after sent_to_employee status.'
    );
    err.statusCode = 403;
    throw err;
  }

  if (documentRecord.status !== 'success') {
    const err = new Error('PDF not available for this document');
    err.statusCode = 409;
    throw err;
  }

  return documentRecord;
};

export const getMyPerformanceReports = async ({ requester, query }) => {
  const employeeId = await resolveEmployeeIdFromRequester(requester);
  const searchRaw = typeof query?.search === 'string' ? query.search.trim() : '';
  const search = searchRaw.slice(0, 100);
  const parsedPage = Number.parseInt(String(query?.page || '1'), 10);
  const parsedLimit = Number.parseInt(String(query?.limit || '20'), 10);
  const page = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);
  const limit = Number.isNaN(parsedLimit) ? 20 : Math.max(1, Math.min(parsedLimit, 100));

  if (!employeeId) {
    logger.warn({
      message: 'Could not resolve employeeId for my performance reports',
      userId: requester?.id || null,
      email: requester?.email || null,
    });

    return {
      documents: [],
      page,
      limit,
      total: 0,
      totalPages: 0,
    };
  }

  const filters: Record<string, any> = {
    documentType: 'performance-report',
    employeeId,
  };

  if (query?.approvalStatus) {
    if (EMPLOYEE_VISIBLE_EPR_STATUSES.includes(String(query.approvalStatus))) {
      filters.approvalStatus = query.approvalStatus;
    } else {
      filters._id = null;
    }
  } else {
    filters.approvalStatus = { $in: EMPLOYEE_VISIBLE_EPR_STATUSES };
  }

  return documentRepository.findDocuments({
    filters,
    search,
    page,
    limit,
  });
};

export const getMyPerformanceReportById = async ({ id, requester }) => {
  const employeeId = await resolveEmployeeIdFromRequester(requester);
  const resolvedRequester =
    employeeId && !requester?.employeeId ? { ...requester, employeeId } : requester;

  if (!employeeId) {
    const err = new Error('Employee profile not found for logged in user');
    err.statusCode = 404;
    throw err;
  }

  const documentRecord = await getAccessibleDocumentById({ id, requester: resolvedRequester });

  if (normalizeIdentifierKey(documentRecord.employeeId) !== normalizeIdentifierKey(employeeId)) {
    const err = new Error('Insufficient permissions');
    err.statusCode = 403;
    throw err;
  }

  if (documentRecord.documentType !== 'performance-report') {
    const err = new Error('Performance report not found');
    err.statusCode = 404;
    throw err;
  }

  return {
    _id: documentRecord._id,
    documentIdentifier: documentRecord.documentIdentifier,
    documentType: documentRecord.documentType,
    employeeId: documentRecord.employeeId,
    employeeName: documentRecord.employeeName,
    hrId: documentRecord.hrId,
    hrName: documentRecord.hrName,
    managerId: documentRecord.managerId,
    status: documentRecord.status,
    approvalStatus: documentRecord.approvalStatus,
    approvalStatusHistory: documentRecord.approvalStatusHistory,
    submittedToHrAt: documentRecord.submittedToHrAt,
    hrReviewedAt: documentRecord.hrReviewedAt,
    hrReviewedById: documentRecord.hrReviewedById,
    hrReviewedByName: documentRecord.hrReviewedByName,
    hrReviewRemarks: documentRecord.hrReviewRemarks,
    sentToEmployeeAt: documentRecord.sentToEmployeeAt,
    sentToEmployeeById: documentRecord.sentToEmployeeById,
    employeeAcknowledgedAt: documentRecord.employeeAcknowledgedAt,
    employeeAcknowledgedById: documentRecord.employeeAcknowledgedById,
    employeeAcknowledgedByName: documentRecord.employeeAcknowledgedByName,
    lockedAt: documentRecord.lockedAt,
    fileName: documentRecord.fileName,
    fileSize: documentRecord.fileSize,
    generationTime: documentRecord.generationTime,
    payload: documentRecord.payload,
    createdAt: documentRecord.createdAt,
    updatedAt: documentRecord.updatedAt,
  };
};

export const getDocumentByIdDetails = async ({ id, requester }) => {
  const documentRecord = await getAccessibleDocumentById({ id, requester });

  return {
    _id: documentRecord._id,
    documentIdentifier: documentRecord.documentIdentifier,
    documentType: documentRecord.documentType,
    employeeId: documentRecord.employeeId,
    employeeName: documentRecord.employeeName,
    hrId: documentRecord.hrId,
    hrName: documentRecord.hrName,
    managerId: documentRecord.managerId,
    status: documentRecord.status,
    approvalStatus: documentRecord.approvalStatus,
    approvalStatusHistory: documentRecord.approvalStatusHistory,
    submittedToHrAt: documentRecord.submittedToHrAt,
    submittedToHrById: documentRecord.submittedToHrById,
    hrReviewedAt: documentRecord.hrReviewedAt,
    hrReviewedById: documentRecord.hrReviewedById,
    hrReviewedByName: documentRecord.hrReviewedByName,
    hrSignatureUrl: documentRecord.hrSignatureUrl,
    hrReviewRemarks: documentRecord.hrReviewRemarks,
    sentToEmployeeAt: documentRecord.sentToEmployeeAt,
    sentToEmployeeById: documentRecord.sentToEmployeeById,
    employeeAcknowledgedAt: documentRecord.employeeAcknowledgedAt,
    employeeAcknowledgedById: documentRecord.employeeAcknowledgedById,
    employeeAcknowledgedByName: documentRecord.employeeAcknowledgedByName,
    employeeAcknowledgementSignatureText: documentRecord.employeeAcknowledgementSignatureText,
    lockedAt: documentRecord.lockedAt,
    fileName: documentRecord.fileName,
    fileSize: documentRecord.fileSize,
    generationTime: documentRecord.generationTime,
    payload: documentRecord.payload,
    createdAt: documentRecord.createdAt,
    updatedAt: documentRecord.updatedAt,
  };
};

export const getDocumentPdfById = async ({ id, requester }) => {
  const documentRecord = await getAccessibleDocumentById({ id, requester });

  const pdfBuffer = await generatePDFBuffer(
    documentRecord.documentType,
    documentRecord.payload || {},
    {
      issuedAt: documentRecord.payload?.issueDate || documentRecord.createdAt,
    }
  );

  const documentIdentifier =
    documentRecord.documentIdentifier ||
    buildDocumentIdentifier({
      documentType: documentRecord.documentType,
      employeeName: documentRecord.payload?.employeeName,
      createdAt: documentRecord.createdAt,
    });

  const fileName = documentRecord.fileName || `${documentIdentifier}.pdf`;

  return {
    documentRecord,
    documentIdentifier,
    fileName,
    pdfBuffer,
  };
};
