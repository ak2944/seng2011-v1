import express, { Express, Request, Response } from 'express';
// import morgan from 'morgan';
import { MongoClient, ServerApiVersion } from 'mongodb';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
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
// app.use(morgan('dev'));

// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || '127.0.0.1';

const uri: string =
    process.env.MONGODB_URI || 'mongodb://localhost:27017/your-app';

const client: MongoClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// DB connection
async function run(): Promise<void> {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {
        console.error("Error connecting to MongoDB:", e);
    } finally {
        await client.close();
    }
};

run().catch(console.dir);

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
