import {Router} from "express";
import {authenticateAccessToken} from "../middlewares/auth.middleware";
import {validateRequest} from "../middlewares/validation.middleware";
import {
    createCategory,
    deleteCategory,
    getCategory,
    listCategories,
    updateCategory
} from "../controllers/word-category.controller";
import {body, param} from "express-validator";


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

router.get('/', listCategories);

router.get(
    '/:id',
    [param('id').isMongoId()],
    validateRequest,
    getCategory
);

router.put(
    '/:id',
    [
        param('id').isMongoId(),
        body('name').optional().isString(),
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