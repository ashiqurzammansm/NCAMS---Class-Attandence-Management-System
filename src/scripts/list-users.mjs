import 'dotenv/config';
import { dbConnect } from '../lib/db.js';
import User from '../lib/models/User.js';

(async () => {
    await dbConnect();
    const users = await User.find({}).select('_id name email role createdAt').sort({ role: 1, email: 1 }).lean();
    console.log('=== USERS ===');
    for (const u of users) {
        console.log(`${u.role.padEnd(16)}  ${String(u._id)}  ${u.email}  (${u.name})`);
    }
    process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
