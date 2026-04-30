import { Router } from 'express';
import * as controller from '../controllers/document.controller.ts';
import { validateToken } from '../../../middlewares/auth.middleware.ts';
import { documentGenerationRateLimiter } from '../../../middlewares/rateLimit.middleware.ts';
import { asyncHandler } from '../../../utils/asyncHandler.ts';
import { DOCUMENT_TYPES } from '../config/document.config.ts';

const router = Router();

const GENERIC_DOCUMENT_TYPES = DOCUMENT_TYPES.filter((documentType) => documentType !== 'performance-report');

for (const documentType of GENERIC_DOCUMENT_TYPES) {
  router.post(
    `/generate/${documentType}`,
    validateToken,
    documentGenerationRateLimiter,
    asyncHandler(controller.generateDocumentByType(documentType))
  );
}

router.post(
  '/performance-reports/draft',
  validateToken,
  documentGenerationRateLimiter,
  asyncHandler(controller.createPerformanceReportDraft)
);

router.get('/auth-test', validateToken, asyncHandler(controller.authTest));
router.get('/', validateToken, asyncHandler(controller.getDocuments));
router.patch(
  '/performance-reports/:id/draft',
  validateToken,
  asyncHandler(controller.updatePerformanceReportDraft)
);
router.post(
  '/performance-reports/:id/submit-to-hr',
  validateToken,
  asyncHandler(controller.submitPerformanceReportToHr)
);
router.post(
  '/performance-reports/:id/hr-review',
  validateToken,
  asyncHandler(controller.reviewPerformanceReportByHr)
);
router.post(
  '/performance-reports/:id/send-to-employee',
  validateToken,
  asyncHandler(controller.sendPerformanceReportToEmployee)
);
router.post(
  '/performance-reports/:id/acknowledge',
  validateToken,
  asyncHandler(controller.acknowledgePerformanceReportByEmployee)
);
router.get(
  '/performance-reports/getMyPerformanceReport',
  validateToken,
  asyncHandler(controller.getMyPerformanceReport)
);
router.get(
  '/performance-reports/getMyPerformanceReportById/:id',
  validateToken,
  asyncHandler(controller.getMyPerformanceReportById)
);
router.get('/:id/pdf', validateToken, asyncHandler(controller.getDocumentPdfById));
router.get('/:id', validateToken, asyncHandler(controller.getDocumentById));

export default router;
