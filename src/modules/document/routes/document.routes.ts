import { Router } from 'express';
import * as controller from '../controllers/document.controller.ts';
import { validateToken } from '../../../middlewares/auth.middleware.ts';
import { documentGenerationRateLimiter } from '../../../middlewares/rateLimit.middleware.ts';
import { asyncHandler } from '../../../utils/asyncHandler.ts';
import { DOCUMENT_TYPES } from '../config/document.config.ts';

const router = Router();

for (const documentType of DOCUMENT_TYPES) {
  router.post(
    `/generate/${documentType}`,
    validateToken,
    documentGenerationRateLimiter,
    asyncHandler(controller.generateDocumentByType(documentType))
  );
}
router.get('/auth-test', validateToken, asyncHandler(controller.authTest));
router.get('/', validateToken, asyncHandler(controller.getDocuments));
router.get('/:id', validateToken, asyncHandler(controller.getDocumentById));

export default router;
