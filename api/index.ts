import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/apiRouter';

dotenv.config();

const app = express();
app.use(express.json());

// Mount router on both '/api' and '/' so it works regardless of Vercel path rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
