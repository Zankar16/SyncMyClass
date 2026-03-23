import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  profileImage: { type: String },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  collection: 'Users' // Specify explicit collection name to match Atlas
});

const User = mongoose.model('User', userSchema);
export default User;
