import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri.split('@')[1]); // hide credentials
try {
    await mongoose.connect(uri);
    console.log('✅ Connected!');
    await mongoose.disconnect();
} catch (e) {
    console.error('❌ Connect error:', e.message);
}
