import './config.js';
import express from 'express';
import cors from 'cors';
import { generate } from './chatbot.js';

const app = express();
const port = 3001;
const chatTimeoutMs = 45_000;
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to ChatDPT!');
});

app.post('/chat', async (req, res) => {
    const { message, threadId } = req.body ?? {};
    if (typeof message !== 'string' || !message.trim() || typeof threadId !== 'string' || !threadId.trim()) {
        res.status(400).json({ message: 'All fields are required!' });
        return;
    }

    console.log('Message', message);

    try {
        const result = await Promise.race([
            generate(message, threadId),
            new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Chat generation timed out')), chatTimeoutMs);
            }),
        ]);
        res.json({ message: result });
        console.log('Response sent');
    } catch (error) {
        console.error('Chat generation failed:', error);
        res.status(500).json({ message: 'Unable to generate a response.' });
    }
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Stop the existing backend before starting another one.`);
    } else {
        console.error('Backend server error:', error);
    }
    process.exitCode = 1;
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled backend error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught backend error:', error);
});
