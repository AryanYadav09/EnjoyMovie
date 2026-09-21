import { Router } from 'express';
import * as configController from '../controllers/config.controller.js';

const router = Router();

router.get('/status', configController.getConfigStatus);
router.post('/api-key', configController.updateApiKey);

export default router;
