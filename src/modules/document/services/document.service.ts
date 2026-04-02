import { Readable } from 'node:stream';
import mongoose from 'mongoose';
import logger from '../../../config/logger.ts';
import { generatePDFBuffer } from '../generators/document.generator.ts';
import * as documentRepository from '../repositories/document.repository.ts';
import { shouldSkipEmployeeExistenceCheck } from '../config/document.config.ts';
import { safeObjectIdError } from '../utils/documentError.util.ts';
import { buildDocumentIdentifier } from '../utils/documentIdentifier.util.ts';
import { buildRoleContext } from '../utils/documentAccess.util.ts';

export const createAndGenerateDocument = async ({
  documentType,
  payload,
  requester,
  requestMetadata,
}) => {
  const startTime = Date.now();
  const roleCtx = buildRoleContext(requester?.roles || []);
  const skipEmployeeCheck = shouldSkipEmployeeExistenceCheck(documentType);

  const employeeId = payload.employeeId || requester?.id || null;
  const hrId = payload.hrId || (roleCtx.isHR ? requester?.id : null);
  const managerId = payload.managerId || (roleCtx.isManager ? requester?.id : null);

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

  if (documentType === 'joining-letter') {
    const offerLetterDocumentId = payload?.offerLetterDocumentId;

    if (offerLetterDocumentId && !mongoose.Types.ObjectId.isValid(String(offerLetterDocumentId))) {
      const err = new Error('offerLetterDocumentId is invalid');
      err.statusCode = 400;
      throw err;
    }

    const offerLetter = await documentRepository.findSuccessfulOfferLetterForEmployee({
      employeeId,
      offerLetterDocumentId,
    });

    if (!offerLetter) {
      const err = new Error(
        offerLetterDocumentId
          ? `Corresponding offer letter ${offerLetterDocumentId} not found for employee ${employeeId}`
          : `No corresponding offer letter found for employee ${employeeId}`
      );
      err.statusCode = 404;
      throw err;
    }
  }

  const documentRecord = await documentRepository.createDocument({
    documentType,
    employeeId,
    employeeName: payload?.employeeName || null,
    hrId,
    hrName: payload?.hrName || null,
    managerId,
    payload,
    requestMetadata,
    status: 'processing',
  });

  try {
    const pdfBuffer = await generatePDFBuffer(documentType, payload, {
      issuedAt: documentRecord.createdAt,
    });
    const generationTime = Date.now() - startTime;
    const documentIdentifier = buildDocumentIdentifier({
      documentType,
      employeeName: payload?.employeeName,
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

  if (roleCtx.isEmployee && !roleCtx.isHR && !roleCtx.isManager) {
    filters.employeeId = requester?.id;
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

export const getDocumentPdfById = async ({ id, requester }) => {
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

  const roleCtx = buildRoleContext(requester?.roles || []);
  const isOwner = documentRecord.employeeId && requester?.id === documentRecord.employeeId;

  if (!roleCtx.isHR && !roleCtx.isManager && !(roleCtx.isEmployee && isOwner)) {
    const err = new Error('Insufficient permissions');
    err.statusCode = 403;
    throw err;
  }

  if (documentRecord.status !== 'success') {
    const err = new Error('PDF not available for this document');
    err.statusCode = 409;
    throw err;
  }

  const pdfBuffer = await generatePDFBuffer(
    documentRecord.documentType,
    documentRecord.payload || {},
    {
      issuedAt: documentRecord.createdAt,
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
