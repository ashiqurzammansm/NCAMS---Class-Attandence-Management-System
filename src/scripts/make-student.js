// Usage (PowerShell):
// node src/scripts/make-student.mjs student1@school.local "Student One" student1-demo Fall-2025

import 'dotenv/config';
import { dbConnect } from '../lib/db.js';
import User from '../lib/models/User.js';
import Student from '../lib/models/Student.js';

async function main() {
    const [,, email, name, studentId, semester] = process.argv;
    if (!email || !name || !studentId || !semester) {
        console.log('Usage: node src/scripts/make-student.mjs <email> "<name>" <studentId> <semester>');
        process.exit(1);
    }

    await dbConnect();

    const u = await User.findOneAndUpdate(
        { email },
        { name, role: 'student' },
        { new: true }
    );

    if (!u) {
        console.log('❌ No user found with that email. Create the user first (admin/teacher form).');
        process.exit(1);
    }

    const s = await Student.findOneAndUpdate(
        { studentId },
        { name, semester, email },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('✅ Updated user role to student and ensured Student record exists.');
    console.log('User:', { id: String(u._id), email: u.email, role: u.role, name: u.name });
    console.log('Student:', { studentId: s.studentId, name: s.name, semester: s.semester, email: s.email });

    process.exit(0);
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
