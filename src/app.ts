import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Create an instance of Express and define the port
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const SECRET_KEY = process.env.SECRET_KEY || 'testkey';

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

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
