import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/printshop';
  await mongoose.connect(uri);
  isConnected = true;
  console.log('MongoDB connected');
}

export default mongoose;
