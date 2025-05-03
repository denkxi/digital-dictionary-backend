import {Router} from "express";
import authRouter from "./auth.routes"
import dictionaryRouter from "./dictionary.routes";
import wordCategoryRouter from "./word-category.routes";

import wordRoutes from "./word.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/dictionary", dictionaryRouter)
router.use("/word-category", wordCategoryRouter)
router.use("/word", wordRoutes)

export default router;