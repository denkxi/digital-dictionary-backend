import express from "express";
import {errorHandler} from "./middlewares/errorHandler";
import helmet from "helmet";
import cors from 'cors';
import morgan from 'morgan';
import apiRoutes from './routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', apiRoutes);

app.use(errorHandler);

export default app;