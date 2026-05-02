import { Router } from 'express';
import * as providerController from '../controllers/providerController.js';
import { isOrganizer } from '../middleware/authMiddleware.js';

const router = Router();

router.use(isOrganizer);

router.get('/', providerController.getProviders);
router.post('/', providerController.createProvider);
router.put('/:id', providerController.updateProvider);
router.delete('/:id', providerController.deleteProvider);
router.post('/link', providerController.linkProviderToService);
router.post('/unlink', providerController.unlinkProviderFromService);

export default router;
