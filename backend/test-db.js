const mongoose = require('mongoose');
require('dotenv').config();

const test = async () => {
  console.log('🔍 Testing MongoDB Connection...');
  console.log('URI:', process.env.MONGO_URI ? 'FOUND (hidden for security)' : 'MISSING');
  
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set in .env');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ SUCCESS! Connected to:', conn.connection.host);
    console.log('🚀 Your database is ready.');
    process.exit(0);
  } catch (err) {
    console.error('❌ FAILED to connect!');
    console.error('Reason:', err.message);
    process.exit(1);
  }
};

test();
