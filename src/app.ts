import express from "express";
import {errorHandlerMiddleware} from "./middlewares/errorHandler.middleware";
import helmet from "helmet";
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes';
import cookieParser from "cookie-parser";

const app = express();

const FRONTEND_URL = 'http://localhost:5173';

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(cookieParser())
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRoutes);

app.use(errorHandlerMiddleware);

export default app;