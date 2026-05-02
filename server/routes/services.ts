import { Router } from 'express';
import { getServices, getServiceById, createService, updateService, togglePublish, deleteService, getQuestions, addQuestion, deleteQuestion } from '../controllers/serviceController.js';
import { verifyToken, isOrganizer } from '../middleware/authMiddleware.js';

const router = Router();
router.use(verifyToken, isOrganizer);

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', createService);
router.put('/:id', updateService);
router.patch('/:id/publish', togglePublish);
router.delete('/:id', deleteService);
router.get('/:id/questions', getQuestions);
router.post('/:id/questions', addQuestion);
router.delete('/:id/questions/:qid', deleteQuestion);

export default router;
