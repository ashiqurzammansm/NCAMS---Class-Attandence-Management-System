export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import User from '@/lib/models/User';
import Student from '@/lib/models/Student';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
    const actor = getUserFromRequest(request);
    if (!actor) {
        return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    }
    // Admin or Teacher can create a student login
    if (actor.role !== 'institute_admin' && actor.role !== 'teacher') {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    await dbConnect();

    const body = await request.json().catch(() => ({}));
    const { name, email, password, studentId, semester } = body || {};
    if (!name || !email || !password || !studentId || !semester) {
        return new Response(JSON.stringify({ message: 'name, email, password, studentId, semester required' }), { status: 400 });
    }

    // Create/Update User (role=student)
    const passwordHash = await bcrypt.hash(password, 10);
    const userDoc = await User.findOneAndUpdate(
        { email },
        { name, role: 'student', passwordHash },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    // Create/Update Student “card” record
    const studentDoc = await Student.findOneAndUpdate(
        { studentId },
        { name, semester, email },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return new Response(JSON.stringify({
        ok: true,
        user: { id: String(userDoc._id), name: userDoc.name, email: userDoc.email, role: userDoc.role },
        student: studentDoc
    }), { status: 200 });
}
