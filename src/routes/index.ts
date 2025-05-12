import {Router} from "express";
import authRouter from "./auth.routes"
import dictionaryRouter from "./dictionary.routes";
import wordCategoryRouter from "./word-category.routes";

import wordRoutes from "./word.routes";
import quizRoutes from "./quiz.routes";
import summaryRoutes from "./summary.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/dictionaries", dictionaryRouter)
router.use("/word-categories", wordCategoryRouter)
router.use("/words", wordRoutes)
router.use("/quizzes", quizRoutes)
router.use("/statistics", summaryRoutes)

export default router;