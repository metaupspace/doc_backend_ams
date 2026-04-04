import * as documentService from '../services/document.service.ts';
import { validateDocumentRequest } from '../validators/document.validation.ts';
import { successResponse, validationErrorResponse } from '../../../utils/apiResponse.ts';
import logger from '../../../config/logger.ts';
import { isPerformanceReport } from '../config/document.config.ts';
import { canCreateDocument, canReadDocuments } from '../utils/documentAccess.util.ts';

export const generateDocument = async (req, res, next) => {
  try {
    const { documentType } = req.params;

    if (!canCreateDocument(documentType, req.user?.roles || [], { isPerformanceReport })) {
      return res.status(403).json({
        status: 'error',
        message:
          documentType === 'performance-report'
            ? 'Only MANAGER or HR role can create performance-report'
            : 'Only HR role can create this document type',
      });
    }

    const { error, value } = validateDocumentRequest(documentType, req.body);
    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));
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
    logger.error(`Get document by id failed: ${error.message}`);
    return next(error);
  }
};

export const authTest = async (req, res) => {
  return successResponse(res, 200, 'Authenticated request successful', {
    user: req.user,
  });
};
