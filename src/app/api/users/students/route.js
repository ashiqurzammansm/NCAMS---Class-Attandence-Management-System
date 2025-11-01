export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/lib/models/User';
import Student from '@/lib/models/Student';
import bcrypt from 'bcryptjs';

function isSID(v) {
    return /^SID\d{5}$/.test(v || '');
}

export async function POST(request) {
    const me = getUserFromRequest(request);
    if (!me) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (me.role !== 'teacher' && me.role !== 'institute_admin') {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { name, email, password, studentId, semester } = body || {};

    if (!name || !email || !password || !studentId || !semester) {
        return new Response(JSON.stringify({ message: 'name, email, password, studentId, semester required' }), { status: 400 });
    }
    if (!isSID(studentId)) {
        return new Response(JSON.stringify({ message: 'studentId must match SID00001 format' }), { status: 400 });
    }

    await dbConnect();

    const passwordHash = await bcrypt.hash(password, 10);

    try {
        // create the auth user
        await User.create({
            name,
            email,
            passwordHash,
            role: 'student',
        });

        // create student card
        await Student.create({
            name,
            email,
            studentId,
            semester,
        });

        return new Response(JSON.stringify({ ok: true }), { status: 201 });
    } catch (e) {
        if (e?.code === 11000) {
            const field = e?.keyPattern?.email ? 'email' : e?.keyPattern?.studentId ? 'studentId' : 'unique';
            return new Response(JSON.stringify({ ok: false, message: `Duplicate ${field}` }), { status: 409 });
        }
        return new Response(JSON.stringify({ ok: false, message: 'Create failed' }), { status: 500 });
    }
}
