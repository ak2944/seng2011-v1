import express, { Express, Request, Response } from 'express';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

// Set up web app
const app: Express = express();
// Use middleware that allows us to access the JSON body of requests
app.use(express.json());
// Use middleware that allows us to access for access from other domains
app.use(cors());
// For loggin errors (print to terminal)
app.use(morgan('dev'));

// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

// const uri: string =
//     process.env.MONGODB_URI || 'mongodb://localhost:27017/your-app';

// DB connection
// (async () => {
//     try {
//         await mongoose.connect(uri);
//         console.log('Connected to the database');
//     } catch(error) {
//         console.error(error);
//     }
// })();

app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('Server is running');
});

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// Handle Ctrl + C gracefully 
process.on('SIGINT', () => {
    server.close(() => console.log('Shutting down server gracefully.'));
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});