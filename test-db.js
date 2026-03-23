import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function testConnection() {
  try {
    console.log('Testing connection to:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    const user = await User.findOne({ userId: 'zankar@gmail.com' });
    if (user) {
      console.log('Found user in DB:', user.userId, user.password);
      if (user.password === '@@zAsh@@0115') {
        console.log('Password match!');
      } else {
        console.log('Password mismatch. DB has:', user.password);
      }
    } else {
      console.log('User not found in the DB. Current collection content summary:');
      const count = await User.countDocuments();
      console.log('Total users in collection:', count);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
