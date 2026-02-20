/**
 * AI Code Mentor Backend Server
 * 
 * This Express server provides an API endpoint for code analysis using AI.
 * It receives code from the VS Code extension, processes it with OpenAI,
 * and returns structured feedback.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const reviewRoutes = require('./routes/review');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// Security middleware
app.use(helmet());

// CORS configuration - allow requests from frontend and extension
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware - parse JSON payloads up to 10MB
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api', reviewRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Validate required environment variables
function validateEnv() {
  const required = ['OPENROUTER_API_KEY', 'MAX_TOKENS', 'TEMPERATURE', 'NODE_ENV'];
  let missing = [];
  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }
  if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please set them in your .env or Render dashboard.');
  }
}

validateEnv();

// Convert numeric env values
const maxTokens = Number(process.env.MAX_TOKENS) || 2048;
const temperature = Number(process.env.TEMPERATURE) || 0.7;

// Start server
app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀 AI Code Mentor Backend Server Started`);
  console.log(`📍 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Review endpoint: http://localhost:${PORT}/api/review`);
  console.log('===========================================');
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('❌ OPENROUTER_API_KEY not configured. The app will not work without it.');
  } else {
    console.log('✅ OpenRouter API key configured');
  }
  console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MAX_TOKENS: ${maxTokens}`);
  console.log(`TEMPERATURE: ${temperature}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});
