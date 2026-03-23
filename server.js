import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './models/User.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/subject_portal';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Atlas!'))
  .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Subject Portal API is running' });
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  console.log(`\n[LOGIN ATTEMPT] Incoming request for userId: ${req.body?.userId}`);
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      console.log(`[LOGIN FAILED] Missing credentials`);
      return res.status(400).json({ message: 'UserId and password are required' });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      console.log(`[LOGIN FAILED] User not found in database: ${userId}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    if (!user.isActive) {
      console.log(`[LOGIN FAILED] Account deactivated: ${userId}`);
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Direct password match (in production, use bcrypt here)
    if (user.password !== password) {
      console.log(`[LOGIN FAILED] Password mismatch for user: ${userId}`);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    console.log(`[LOGIN SUCCESS] User logged in: ${userId} with role ${user.userType}`);
    // Success - return user data and a dummy token
    return res.status(200).json({
      message: 'Login successful',
      token: 'dummy-token-' + Date.now(),
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        role: user.userType,
        profileImage: user.profileImage
      }
    });

  } catch (error) {
    console.error('[LOGIN ERROR] Exception:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Subject Portal API Server is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
