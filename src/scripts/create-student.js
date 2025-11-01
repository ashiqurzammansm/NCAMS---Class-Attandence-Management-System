import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { dbConnect } from '../lib/db.js';
import User from '../lib/models/User.js';
import Student from '../lib/models/Student.js';

// Usage:
// node src/scripts/create-student.mjs student1@school.local "Student One" student1-demo "Fall-2025" "Student@123"

(async () => {
    const [,, email, name, studentId, semester, password] = process.argv;
    if (!email || !name || !studentId || !semester || !password) {
        console.log('Usage: node src/scripts/create-student.mjs <email> "<name>" <studentId> <semester> <password>');
        process.exit(1);
    }

    await dbConnect();

    const passwordHash = await bcrypt.hash(password, 10);
    const u = await User.findOneAndUpdate(
        { email },
        { name, role: 'student', passwordHash },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    const s = await Student.findOneAndUpdate(
        { studentId },
        { name, semester, email },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    console.log('✅ Created/updated student user & card:');
    console.log({ user: { id: String(u._id), email: u.email, role: u.role, name: u.name }, student: s });
    process.exit(0);
})().catch(e => { console.error('❌', e); process.exit(1); });
