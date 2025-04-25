import {Router} from "express";
import authRouter from "./auth.routes"
import dictionaryRouter from "./dictionary.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/dictionary", dictionaryRouter)

export default router;