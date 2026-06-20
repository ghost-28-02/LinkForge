import { Router } from 'express';
import {
  createLink,
  listLinks,
  deleteLink,
  getQrCode,
} from '../controllers/linkController.js';
import { getLinkAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { shortenLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(authenticate);

router.post('/', shortenLimiter, createLink);
router.get('/', listLinks);
router.get('/:id/qr', getQrCode);
router.get('/:id/analytics', getLinkAnalytics);
router.delete('/:id', deleteLink);

export default router;
