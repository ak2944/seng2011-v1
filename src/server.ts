import express, { Express, Request, Response } from 'express';
// import morgan from 'morgan';
// import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.json';
import cors from 'cors';
// import errorHandler from 'middleware-http-errors';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import process from 'process';

import { User } from './user';
import { cancelAdvice } from './advice';
import { INVALID_REASON } from './errors';

dotenv.config();

// Set up web app
const app: Express = express();
// Use middleware that allows us to access the JSON body of requests
app.use(express.json());
// Use middleware that allows us to access for access from other domains
app.use(cors());
// For loggin errors (print to terminal)
// app.use(morgan('dev'));

// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

const uri: string =
    process.env.MONGODB_URI || '';

// DB connection
mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:", err'));

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('Server is running');
});

app.delete('/api/despatchAdvice/cancel', (req: Request, res: Response) => {
    const { id, reason } = req.body;

    try {
        const result = cancelAdvice(id, reason);
        res.json(result);
    } catch (e) {
        if (e === INVALID_REASON) {
            res.status(400).json({ error: e.message });
        } else {
            res.status(404).json({ error: e.message });
        }
    }
});

// =============================================================================
// =============================   Routes    ===================================
// =============================================================================

app.post('/add-mock-user', async (_req: Request, res: Response) => {
    try {
        const mockUser = new User({
            name: 'John Doe',
            email: `johndoe${Math.floor(Math.random() * 10000)}@example.com`, // Prevent duplicate emails
        });
        await mockUser.save();
        res.status(201).json({ message: 'Mock user added successfully!', user: mockUser });
    } catch (error) {
        console.error('Error adding mock user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// =============================================================================
// =============================================================================

// Handle Ctrl + C gracefully
process.on('SIGINT', async () => {
    server.close(() => console.log('Shutting down server gracefully.'));
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
});
