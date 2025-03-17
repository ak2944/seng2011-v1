import express, { Request, Response } from 'express';
// import morgan from 'morgan';
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
import { parseOrderXml } from './parseOrder';
import { generateDespatchAdvice } from './despatchAdvice';
import { DespatchAdviceRequestBody } from './types/despatchTypes';
import { despatchSchema } from '../db-schemas';
import { validateDespatchAdviceUserInputs } from './helpers';

dotenv.config();

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests

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

const uri: string = process.env.MONGODB_URI || '';

// DB connection
mongoose
    .connect(uri, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Start server
const server = app.listen(PORT, HOST, () => {
    console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('Server is running');
});

// =============================================================================
// =============================   Routes    ===================================
// =============================================================================

app.post('/api/v1/order/parse', express.text({ type: 'application/xml' }), (req: Request, res: Response) => {
    try {
        const orderXml = req.body as string;
        if (!orderXml) {
            return res.status(400).json({ error: 'No XML found in request body.' });
        }

        const parsedOrder = parseOrderXml(orderXml);
        return res.status(200).json({ parsedOrder });
    } catch (error) {
        console.error('Error in parseOrderXml:', error);
        return res.status(500).json({ error: String(error) });
    }
});

app.use(express.json());

const DespatchAdviceModel = mongoose.model('DespatchAdvice', despatchSchema);

app.post('/api/v1/despatch-advice/generate', async (req: Request, res: Response) => {
    try {
        const body: DespatchAdviceRequestBody = req.body;

        if (!body.parsedOrder) {
            res.status(400).json({ error: 'parsedOrder is missing.' });
        }

        console.log(body.userInputs);

        if (!validateDespatchAdviceUserInputs(body.userInputs)) {
            return res.status(500).json({ error: 'Could not generate Despatch Advice' });
        }

        const xml = generateDespatchAdvice(body.parsedOrder, body.userInputs);

        const docUUID = body.parsedOrder.orderUUID;
        const despatchId = body.parsedOrder.orderId;

        const existing = await DespatchAdviceModel.findOne({ docUUID });
        if (existing) {
            return res.status(409).json({
                error: `A Despatch Advice with UUID '${docUUID}' already exists.`
            });
        }

        const advice = new DespatchAdviceModel({ docUUID, despatchId, xml });
        await advice.save();

        return res.type('application/xml').status(200).send(xml);
    } catch (error) {
        console.error('Error generating Despatch Advice:', error);
        res.status(500).json({ error: 'Could not generate Despatch Advice' });
    }
});

app.get('/api/v1/despatch-advice/:uuid', async (req: Request, res: Response) => {
    try {
        const { uuid } = req.params;

        const found = await DespatchAdviceModel.findOne({ docUUID: uuid });
        if (!found) {
            return res.status(404).json({ error: 'Despatch Advice not found' });
        }

        return res.type('application/xml').status(200).send(found.xml);
    } catch (error) {
        console.error('Error retrieving Despatch Advice:', error);
        return res.status(500).json({ error: 'Failed to retrieve Despatch Advice' });
    }
});

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
// =============================================================================

// Handle Ctrl + C gracefully
process.on('SIGINT', async () => {
    server.close(() => console.log('Shutting down server gracefully.'));
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
});
