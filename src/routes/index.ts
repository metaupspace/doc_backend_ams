import { Router } from 'express';
import documentRoutes from '../modules/document/routes/document.routes.ts';

const router = Router();

/**
 * API v1 routes
 */
router.use('/v1/documents', documentRoutes);


export default router;
