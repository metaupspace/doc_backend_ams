import * as documentService from '../services/document.service.ts';
import { validateDocumentRequest } from '../validators/document.validation.ts';
import { successResponse, validationErrorResponse } from '../../../utils/apiResponse.ts';
import logger from '../../../config/logger.ts';
import { isPerformanceReport } from '../config/document.config.ts';
import { canCreateDocument, canReadDocuments } from '../utils/documentAccess.util.ts';
import * as performanceReportWorkflowService from '../services/performanceReportWorkflow.service.ts';
import {
  validatePerformanceReportDraftUpdateRequest,
  validatePerformanceReportEmployeeAcknowledgeRequest,
  validatePerformanceReportHrReviewRequest,
  validatePerformanceReportIdParam,
} from '../validators/performanceReportWorkflow.validation.ts';

const toValidationErrors = (error) =>
  error.details.map((d) => ({
    field: d.path.join('.'),
    message: d.message,
  }));

export const generateDocument = async (req, res, next) => {
  try {
    const { documentType } = req.params;

    if (!canCreateDocument(documentType, req.user?.roles || [], { isPerformanceReport })) {
      return res.status(403).json({
        status: 'error',
        message:
          documentType === 'performance-report'
            ? 'Only MANAGER role can create performance-report'
            : 'Only HR role can create this document type',
      });
    }

    const { error, value } = validateDocumentRequest(documentType, req.body);
    if (error) {
      const errors = toValidationErrors(error);
      return validationErrorResponse(res, errors);
    }

    const requestMetadata = {
      userId: req.user?.id || 'unknown',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    const { documentRecord, pdfStream } = await documentService.createAndGenerateDocument({
      documentType,
      payload: value.payload,
      requester: req.user,
      requestMetadata,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${documentRecord.fileName}"`);
    res.setHeader('X-Document-Id', String(documentRecord.documentIdentifier || documentRecord._id));

    pdfStream.on('error', (err) => {
      logger.error(`PDF stream error: ${err.message}`);
      if (!res.headersSent) {
        res.status(500).json({ status: 'error', message: 'Failed to stream PDF' });
      }
    });

    pdfStream.pipe(res);
  } catch (error) {
    logger.error(`Document generation controller error: ${error.message}`);
    return next(error);
  }
};

export const generateDocumentByType = (documentType) => {
  return async (req, res, next) => {
    req.params = {
      ...req.params,
      documentType,
    };
    return generateDocument(req, res, next);
  };
};

export const createPerformanceReportDraft = async (req, res, next) => {
  req.params = {
    ...req.params,
    documentType: 'performance-report',
  };

  return generateDocument(req, res, next);
};

export const getDocuments = async (req, res, next) => {
  try {
    if (!canReadDocuments(req.user?.roles || [])) {
      return res.status(403).json({
        status: 'error',
        message: 'Only EMPLOYEE, HR, or MANAGER can access documents',
      });
    }

    const result = await documentService.getDocuments({
      requester: req.user,
      query: req.query,
    });

    return successResponse(res, 200, 'Documents retrieved', {
      count: result.documents.length,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      search: typeof req.query?.search === 'string' ? req.query.search.trim() : '',
      documents: result.documents,
    });
  } catch (error) {
    logger.error(`Get documents failed: ${error.message}`);
    return next(error);
  }
};

export const getDocumentById = async (req, res, next) => {
  try {
    if (!canReadDocuments(req.user?.roles || [])) {
      return res.status(403).json({
        status: 'error',
        message: 'Only EMPLOYEE, HR, or MANAGER can access documents',
      });
    }

    const documentRecord = await documentService.getDocumentByIdDetails({
      id: req.params.id,
      requester: req.user,
    });

    return successResponse(res, 200, 'Document retrieved', {
      document: documentRecord,
    });
  } catch (error) {
    logger.error(`Get document by id failed: ${error.message}`);
    return next(error);
  }
};

export const getDocumentPdfById = async (req, res, next) => {
  try {
    if (!canReadDocuments(req.user?.roles || [])) {
      return res.status(403).json({
        status: 'error',
        message: 'Only EMPLOYEE, HR, or MANAGER can access documents',
      });
    }

    const { documentRecord, documentIdentifier, fileName, pdfBuffer } =
      await documentService.getDocumentPdfById({
        id: req.params.id,
        requester: req.user,
      });

    res.setHeader('Content-Type', documentRecord.pdfMimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('X-Document-Id', String(documentIdentifier || documentRecord._id));

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    logger.error(`Get document pdf by id failed: ${error.message}`);
    return next(error);
  }
};

export const getMyPerformanceReport = async (req, res, next) => {
  try {
    const normalizedRoles = (req.user?.roles || []).map((role) => String(role).toUpperCase());
    if (!normalizedRoles.includes('EMPLOYEE')) {
      return res.status(403).json({
        status: 'error',
        message: 'Only EMPLOYEE can access own performance reports',
      });
    }

    const result = await documentService.getMyPerformanceReports({
      requester: req.user,
      query: req.query,
    });

    return successResponse(res, 200, 'My performance reports retrieved', {
      count: result.documents.length,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: result.totalPages,
      search: typeof req.query?.search === 'string' ? req.query.search.trim() : '',
      documents: result.documents,
    });
  } catch (error) {
    logger.error(`Get my performance reports failed: ${error.message}`);
    return next(error);
  }
};

export const getMyPerformanceReportById = async (req, res, next) => {
  try {
    const normalizedRoles = (req.user?.roles || []).map((role) => String(role).toUpperCase());
    if (!normalizedRoles.includes('EMPLOYEE')) {
      return res.status(403).json({
        status: 'error',
        message: 'Only EMPLOYEE can access own performance reports',
      });
    }

    const idValidation = validatePerformanceReportIdParam(req.params.id);
    if (idValidation.error) {
      return validationErrorResponse(res, toValidationErrors(idValidation.error));
    }

    const documentRecord = await documentService.getMyPerformanceReportById({
      id: req.params.id,
      requester: req.user,
    });

    return successResponse(res, 200, 'My performance report retrieved', {
      document: documentRecord,
    });
  } catch (error) {
    logger.error(`Get my performance report by id failed: ${error.message}`);
    return next(error);
  }
};

export const authTest = async (req, res) => {
  return successResponse(res, 200, 'Authenticated request successful', {
    user: req.user,
  });
};

export const updatePerformanceReportDraft = async (req, res, next) => {
  try {
    const idValidation = validatePerformanceReportIdParam(req.params.id);
    if (idValidation.error) {
      return validationErrorResponse(res, toValidationErrors(idValidation.error));
    }

    const { error, value } = validatePerformanceReportDraftUpdateRequest(req.body);
    if (error) {
      return validationErrorResponse(res, toValidationErrors(error));
    }

    const documentRecord = await performanceReportWorkflowService.updateDraftPerformanceReport({
      id: req.params.id,
      requester: req.user,
      payload: value.payload,
    });

    return successResponse(res, 200, 'Performance report draft updated', {
      id: documentRecord._id,
      approvalStatus: documentRecord.approvalStatus,
      updatedAt: documentRecord.updatedAt,
    });
  } catch (error) {
    logger.error(`Update performance report draft failed: ${error.message}`);
    return next(error);
  }
};

export const submitPerformanceReportToHr = async (req, res, next) => {
  try {
    const idValidation = validatePerformanceReportIdParam(req.params.id);
    if (idValidation.error) {
      return validationErrorResponse(res, toValidationErrors(idValidation.error));
    }

    const documentRecord = await performanceReportWorkflowService.submitPerformanceReportToHr({
      id: req.params.id,
      requester: req.user,
    });

    return successResponse(res, 200, 'Performance report submitted to HR', {
      id: documentRecord._id,
      approvalStatus: documentRecord.approvalStatus,
      submittedToHrAt: documentRecord.submittedToHrAt,
    });
  } catch (error) {
    logger.error(`Submit performance report to HR failed: ${error.message}`);
    return next(error);
  }
};

export const reviewPerformanceReportByHr = async (req, res, next) => {
  try {
    const idValidation = validatePerformanceReportIdParam(req.params.id);
    if (idValidation.error) {
      return validationErrorResponse(res, toValidationErrors(idValidation.error));
    }

    const { error, value } = validatePerformanceReportHrReviewRequest(req.body);
    if (error) {
      return validationErrorResponse(res, toValidationErrors(error));
    }

    const documentRecord = await performanceReportWorkflowService.reviewPerformanceReportByHr({
      id: req.params.id,
      requester: req.user,
      decision: value.decision,
      hrName: value.hrName,
      remarks: value.remarks,
    });

    return successResponse(res, 200, 'Performance report reviewed by HR', {
      id: documentRecord._id,
      approvalStatus: documentRecord.approvalStatus,
      hrReviewedAt: documentRecord.hrReviewedAt,
    });
  } catch (error) {
    logger.error(`HR review for performance report failed: ${error.message}`);
    return next(error);
  }
};

export const sendPerformanceReportToEmployee = async (req, res, next) => {
  try {
    const idValidation = validatePerformanceReportIdParam(req.params.id);
    if (idValidation.error) {
      return validationErrorResponse(res, toValidationErrors(idValidation.error));
    }

    const documentRecord = await performanceReportWorkflowService.sendPerformanceReportToEmployee({
      id: req.params.id,
      requester: req.user,
    });

    return successResponse(res, 200, 'Performance report sent to employee', {
      id: documentRecord._id,
      approvalStatus: documentRecord.approvalStatus,
      sentToEmployeeAt: documentRecord.sentToEmployeeAt,
    });
  } catch (error) {
    logger.error(`Send performance report to employee failed: ${error.message}`);
    return next(error);
  }
};

export const acknowledgePerformanceReportByEmployee = async (req, res, next) => {
  try {
    const idValidation = validatePerformanceReportIdParam(req.params.id);
    if (idValidation.error) {
      return validationErrorResponse(res, toValidationErrors(idValidation.error));
    }

    const { error, value } = validatePerformanceReportEmployeeAcknowledgeRequest(req.body || {});
    if (error) {
      return validationErrorResponse(res, toValidationErrors(error));
    }

    const documentRecord = await performanceReportWorkflowService.acknowledgePerformanceReportByEmployee(
      {
        id: req.params.id,
        requester: req.user,
        employeeName: value.employeeName,
      }
    );

    return successResponse(res, 200, 'Performance report acknowledged by employee', {
      id: documentRecord._id,
      approvalStatus: documentRecord.approvalStatus,
      employeeAcknowledgedAt: documentRecord.employeeAcknowledgedAt,
      employeeAcknowledgedByName: documentRecord.employeeAcknowledgedByName,
      lockedAt: documentRecord.lockedAt,
    });
  } catch (error) {
    logger.error(`Employee acknowledgement for performance report failed: ${error.message}`);
    return next(error);
  }
};
