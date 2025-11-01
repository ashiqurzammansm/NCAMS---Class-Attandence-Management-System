// Load .env
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../lib/db.js';
import User from '../lib/models/User.js';

const ADMIN_NAME = 'Super Admin';
const ADMIN_EMAIL = 'admin@school.local';     // <-- change if you want
const ADMIN_PASSWORD = 'Admin@123';           // <-- change if you want

async function main() {
    await dbConnect();

    // Create/Update ONLY the Admin user
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await User.findOneAndUpdate(
        { email: ADMIN_EMAIL },
        { name: ADMIN_NAME, role: 'institute_admin', passwordHash },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('✅ Seed complete:');
    console.log(`   Admin: ${admin.email} / ${ADMIN_PASSWORD}`);
    console.log('   No teacher or student demo accounts were created.');
    console.log('   → Use Admin to create Teachers; Teachers will create Students.');
    process.exit(0);
}

main().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
