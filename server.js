import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables explicitly from server/.env relative to this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

import debateRoutes from './routes/debateRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { isApiKeyConfigured } from './services/aiService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - allow frontend dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Body parser middleware with payload limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API Routes
app.use('/api', debateRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(` DebateArena AI Server running on port ${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` API Key Status: ${isApiKeyConfigured() ? 'Configured (Live AI Active)' : 'NOT CONFIGURED (Running in Demo Mode)'}`);
  console.log(`=================================================`);
});
