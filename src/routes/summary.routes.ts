import { Router } from 'express';
import { query } from 'express-validator';
import { authenticateAccessToken } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validation.middleware';
import {
    userSummary,
    dictionarySummary
} from '../controllers/summary.controller';

const router = Router();
router.use(authenticateAccessToken);

router.get('/user-summary', userSummary);

router.get(
    '/dictionary-summary',
    [
        query('dictionaryId').exists().isMongoId().withMessage('Invalid dictionaryId'),
    ],
    validateRequest,
    dictionarySummary
);

export default router;
