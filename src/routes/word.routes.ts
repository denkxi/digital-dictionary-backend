import {authenticateAccessToken} from "../middlewares/auth.middleware";
import {Router} from "express";
import {body, param, query} from "express-validator";
import {EWordClass} from "../types/types";
import {validateRequest} from "../middlewares/validation.middleware";
import {createWord, deleteWord, getWord, listAllWords, listWords, updateWord} from "../controllers/word.controller";


const router = Router();

router.use(authenticateAccessToken);

router.post(
    '/',
    [
        body('dictionaryId').isMongoId(),
        body('categoryId').optional().isMongoId(),
        body('writing').isString().notEmpty(),
        body('translation').isString().notEmpty(),
        body('pronunciation').optional().isString(),
        body('definition').optional().isString(),
        body('useExample').optional().isString(),
        body('wordClass').optional().isIn(Object.values(EWordClass)),
        body('isStarred').optional().isBoolean(),
        body('isLearned').optional().isBoolean(),
    ],
    validateRequest,
    createWord
);

router.get(
    '/all',
    [
        query('dictionaryId').isMongoId(),
    ],
    validateRequest,
    listAllWords
);

router.get(
    '/',
    [
            query('dictionaryId').isMongoId(),
            query('search').optional().isString(),
            query('sort')
                .optional()
                .isIn(['name-asc','name-desc','date-asc','date-desc']),
            query('wordClass').optional().isIn(Object.values(EWordClass)),
            query('starred').optional().isBoolean(),
            query('learned').optional().isBoolean(),
            query('page').optional().isInt({ min: 1 }),
            query('limit').optional().isInt({ min: 1 }),
    ],
    validateRequest,
    listWords
);

router.get(
    '/:id',
    [
        param('id').isMongoId(),
    ],
    validateRequest,
    getWord
);

router.patch(
    '/:id',
    [
        param('id').isMongoId(),
        body('categoryId').optional().isMongoId(),
        body('writing').optional().isString().notEmpty(),
        body('translation').optional().isString().notEmpty(),
        body('pronunciation').optional().isString(),
        body('definition').optional().isString(),
        body('useExample').optional().isString(),
        body('wordClass').optional().isIn(Object.values(EWordClass)),
        body('isStarred').optional().isBoolean(),
        body('isLearned').optional().isBoolean(),
    ],
    validateRequest,
    updateWord
);

router.delete(
    '/:id',
    [ param('id').isMongoId() ],
    validateRequest,
    deleteWord
);

export default router;