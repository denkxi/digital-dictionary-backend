import {Router} from "express";
import {authenticateAccessToken} from "../middlewares/auth.middleware";
import {
    borrowDictionary,
    createDictionary, deleteDictionary,
    getOwnById, getPublicById, listAllDictionaries,
    listOpen,
    listOwn, listUserDictionaries, returnDictionary,
    updateDictionary
} from "../controllers/dictionary.controller";
import {body, param} from "express-validator";
import {validateRequest} from "../middlewares/validation.middleware";


const router = Router();

router.use(authenticateAccessToken);

router.post(
    '/',
    [
        body('name').isString().notEmpty(),
        body('sourceLanguage').isString().notEmpty(),
        body('targetLanguage').isString().notEmpty(),
        body('description').optional().isString().notEmpty(),
        body('isOpen').optional().isBoolean().notEmpty(),
    ],
    validateRequest,
    createDictionary
);

router.get('/', listUserDictionaries);

router.get('/all', listAllDictionaries);

router.get('/all-open', listOpen);

router.get('/created-by-me', listOwn);

router.get(
    '/:id',
    [param('id').isMongoId()],
    validateRequest,
    getOwnById
);

router.get(
    '/:id/public',
    [param('id').isMongoId()],
    validateRequest,
    getPublicById
);

router.patch(
    '/:id',
    [
        param('id').isMongoId(),
        body('name').optional().isString().notEmpty(),
        body('sourceLanguage').optional().isString().notEmpty(),
        body('targetLanguage').optional().isString().notEmpty(),
        body('description').optional().notEmpty(),
        body('isOpen').optional().isBoolean().notEmpty(),
    ],
    validateRequest,
    updateDictionary
);

router.delete(
    '/:id',
    [
        param('id').isMongoId()
    ],
    validateRequest,
    deleteDictionary
);

router.post(
    '/:id/borrow',
    [
        param('id').isMongoId()
    ],
    validateRequest,
    borrowDictionary
);


router.delete(
    '/:id/return',
    [
        param('id').isMongoId()
    ],
    validateRequest,
    returnDictionary
)

export default router;