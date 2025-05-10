import {Router} from "express";
import {authenticateAccessToken} from "../middlewares/auth.middleware";
import {validateRequest} from "../middlewares/validation.middleware";
import {
    createCategory,
    deleteCategory,
    getCategory, listAllCategories,
    listCategories,
    updateCategory
} from "../controllers/word-category.controller";
import {body, param, query} from "express-validator";


const router = Router();
router.use(authenticateAccessToken);

router.post(
    '/',
    [
        body('name').isString().notEmpty(),
        body('description').optional().isString()
    ],
    validateRequest,
    createCategory
);


router.get(
    '/',
    [
        query('search').optional().isString(),
        query('sort').optional().isIn(['name-asc','name-desc','date-asc','date-desc']),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1 }),
    ],
    validateRequest,
    listCategories
);

router.get(
    '/all',
    validateRequest,
    listAllCategories
);

router.get(
    '/:id',
    [ param('id').isMongoId() ],
    validateRequest,
    getCategory
);


router.patch(
    '/:id',
    [
        param('categoryId').isMongoId(),
        body('name').optional().isString().notEmpty(),
        body('description').optional().isString(),
    ],
    validateRequest,
    updateCategory
);

router.delete(
    '/:id',
    [param('id').isMongoId()],
    validateRequest,
    deleteCategory
);

export default router;