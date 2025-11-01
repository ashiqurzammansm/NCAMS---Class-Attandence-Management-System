import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../lib/db.js';
import User from '../lib/models/User.js';

// Usage:
// node src/scripts/set-password.mjs student1@school.local "NewPass@123"

(async () => {
    const [,, email, password] = process.argv;
    if (!email || !password) {
        console.log('Usage: node src/scripts/set-password.mjs <email> <password>');
        process.exit(1);
    }
    await dbConnect();

    const passwordHash = await bcrypt.hash(password, 10);
    const u = await User.findOneAndUpdate(
        { email },
        { passwordHash },
        { new: true }
    ).lean();

    if (!u) {
        console.log('❌ No user found with that email');
        process.exit(1);
    }
    console.log('✅ Password updated for:', u.email, 'role:', u.role);
    process.exit(0);
})().catch(e => { console.error('❌', e); process.exit(1); });
