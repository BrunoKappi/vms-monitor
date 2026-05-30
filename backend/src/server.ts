import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cameraRoutes from './routes/Camera.Route';
import systemRoutes from './routes/System.Route';
import { errorHandlerMiddleware } from './middlewares/Error.Middleware';
import { StreamService } from './services/Stream.Service';
import { CONFIG } from './config/App.Config';

const app = express();

// Security and utility middleware configuration
app.use(helmet({
  contentSecurityPolicy: false // Allow WebSocket/Canvas/Blob streams to communicate
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Mounted REST API endpoints
app.use('/api/cameras', cameraRoutes);
app.use('/api/system', systemRoutes);

// 404 Route handler fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route not found' });
});

// Centralized error middleware
app.use(errorHandlerMiddleware);

// Bootstrap Express REST API Server
const server = app.listen(CONFIG.port, () => {
  console.log(`REST API Server running on http://localhost:${CONFIG.port}`);
});

// Bootstrap WebSockets RTSP-transcode Streaming Server
const streamService = new StreamService();
streamService.start();

// Setup graceful process cleanup handles
const handleGracefulShutdown = () => {
  console.log('\nReceived shutdown signal. Commencing clean shut down...');
  server.close(() => {
    streamService.shutdown();
    console.log('Backend servers stopped successfully. Bye!');
    process.exit(0);
  });
};

process.on('SIGINT', handleGracefulShutdown);
process.on('SIGTERM', handleGracefulShutdown);

// Prevent raw ONVIF SOAP network socket rejections or uncaught exceptions from crashing the Express process
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection detected:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception detected:', error);
});
