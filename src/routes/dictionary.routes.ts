import {Router} from "express";
import {authenticateAccessToken} from "../middlewares/auth.middleware";
import {getAll} from "../controllers/dictionary.controller";


const router = Router();


router.get(
    '/all',
    authenticateAccessToken,
    getAll
);

export default router;