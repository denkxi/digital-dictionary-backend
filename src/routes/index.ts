import {Router} from "express";
import authRouter from "./auth.routes"
import dictionaryRouter from "./dictionary.routes";
import wordCategoryRouter from "./word-category.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/dictionary", dictionaryRouter)
router.use("/word-category", wordCategoryRouter)

export default router;