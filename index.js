import "dotenv/config";
import  express from 'express';
import  cors from 'cors';
import {connectDB} from './config/db.js';

// Import routes
import merchantRoutes from './routes/merchants.js';
import trustRoutes from './routes/trust.js';
import fraudRoutes from './routes/fraud.js';
import graphRoutes from './routes/graph.js';

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
import  rateLimit from 'express-rate-limit'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // 1000 requests per windowMs
});
app.use('/api/', limiter);

// Routes
app.use('/api/merchants', merchantRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/graph', graphRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Community Trust Mesh API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV}`);
});