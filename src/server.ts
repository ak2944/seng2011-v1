import express, { NextFunction, Request, Response } from 'express';
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
import jwt from 'jsonwebtoken';
import { User } from './user';
import { parseOrderXml } from './parseOrder';
import { generateDespatchAdvice } from './despatchAdvice';
import { DespatchAdviceRequestBody } from './types/despatchTypes';
import { DespatchAdviceModel } from '../db-schemas';
import { getErrorMessage, validateDespatchAdviceUserInputs } from './helpers';
import { cancelAdvice } from './advice';

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

const SECRET_KEY = process.env.SECRET_KEY || 'testkey';

// For Auth
// Define an interface for the JWT payload
interface IUserPayload {
    username: string;
}

// Extend the Express Request interface to add a "user" property
declare module 'express-serve-static-core' {
    interface Request {
        user?: IUserPayload | string;
    }
}

// Middleware to authenticate JWT tokens
// checks for the token in the Auth header and verifies it
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    // Expected header format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Extract token

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            res.status(403).json({ message: 'Invalid or expired token' });
            return;
        }
        // Token is valid, so attach the decoded payload to the request
        req.user = decoded as IUserPayload;
        next();
    });
};

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

// const DespatchAdviceModel = mongoose.model('DespatchAdvice', despatchSchema);

app.delete('/api/despatchAdvice/cancel', async (req: Request, res: Response) => {
    const { id, reason } = req.body;

    try {
        const result = await cancelAdvice(id, reason);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: getErrorMessage(error) });
    }
});

app.post('/api/v1/despatch-advice/generate', async (req: Request, res: Response) => {
    try {
        const body: DespatchAdviceRequestBody = req.body;

        if (!body.parsedOrder) {
            return res.status(400).json({ error: 'parsedOrder is missing.' });
        }

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

// Auth routes
// Login endpoint: Simulate user login and generate a JWT token
// Future iteration, validate user credentials before issuing a token
app.post('/login', (req: Request, res: Response, next: NextFunction): void => {
    const { username } = req.body;

    if (!username) {
        res.status(400).json({ message: 'Username is required' });
        return;
    }

    // Create the token payload
    const payload: IUserPayload = { username };

    // Sign the JWT token (expires in 1 hour)
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    res.json({ accessToken: token });
});

// Protected endpoint: Only accessible with a valid JWT token
app.get('/despatch-advice', authenticateToken, (req: Request, res: Response) => {
    res.json({ message: 'Protected Despatch Advice endpoint', user: req.user });
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
