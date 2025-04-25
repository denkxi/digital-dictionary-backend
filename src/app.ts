import express from "express";
import {errorHandlerMiddleware} from "./middlewares/errorHandler.middleware";
import helmet from "helmet";
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes';
import cookieParser from "cookie-parser";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser())

app.use('/api', apiRoutes);

app.use(errorHandlerMiddleware);

export default app;