import {authenticateAccessToken} from "../middlewares/auth.middleware";
import {Router} from "express";
import {body, param} from "express-validator";
import {EWordClass} from "../types/types";
import {validateRequest} from "../middlewares/validation.middleware";
import {createWord, deleteWord, getWord, listWords, updateWord} from "../controllers/word.controller";


const router = Router();

router.use(authenticateAccessToken);

router.post(
    '/:dictionaryId',
    [
        param('dictionaryId').isMongoId(),
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
    '/:dictionaryId',
    [
        param('dictionaryId').isMongoId(),
    ],
    validateRequest,
    listWords
);

router.get(
    '/word/:id',
    [
        param('id').isMongoId(),
    ],
    validateRequest,
    getWord
);

router.put(
    '/:id',
    [
        param('id').isMongoId(),
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
    updateWord
);

router.delete(
    '/word/:id',
    [ param('id').isMongoId() ],
    validateRequest,
    deleteWord
);

export default router;