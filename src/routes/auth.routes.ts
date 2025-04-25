import {body} from "express-validator";
import {Router} from "express";
import { validateRequest } from "../middlewares/validation.middleware";
import {login, logout, refresh, register} from "../controllers/auth.controller";
import {requireRefreshToken, verifyRefreshTokenMetadata} from "../middlewares/auth.middleware";


const router = Router();

router.post(
    '/register',
    [
        body('name').isString().notEmpty(),
        body('email').isEmail(),
        body('password').isLength({ min: 6, max: 32}),
    ],
    validateRequest,
    register
);

router.post(
    '/login',
    [
        body('email').isEmail(),
        body('password').isString().notEmpty(),
    ],
    validateRequest,
    login
);

router.post(
    '/logout',
    requireRefreshToken,
    verifyRefreshTokenMetadata,
    logout
);

router.post(
    '/refresh-token',
    requireRefreshToken,
    verifyRefreshTokenMetadata,
    refresh
);

export default router;