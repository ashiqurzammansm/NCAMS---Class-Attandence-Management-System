export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';

function isFacultyId(v) {
    return /^FID\d{5}$/.test(v);
}

export async function POST(request) {
    const me = getUserFromRequest(request);
    if (!me) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (me.role !== 'institute_admin') return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });

    const body = await request.json().catch(() => ({}));
    const { name, email, password, facultyId } = body || {};

    if (!name || !email || !password || !facultyId) {
        return new Response(JSON.stringify({ message: 'name, email, password, facultyId required' }), { status: 400 });
    }
    if (!isFacultyId(facultyId)) {
        return new Response(JSON.stringify({ message: 'facultyId format must be FID00001' }), { status: 400 });
    }

    await dbConnect();

    const passwordHash = await bcrypt.hash(password, 10);
    try {
        const u = await User.create({
            name,
            email,
            passwordHash,
            role: 'teacher',
            facultyId,
        });
        return new Response(JSON.stringify({ ok: true, id: String(u._id) }), { status: 201 });
    } catch (e) {
        if (e?.code === 11000) {
            // duplicate email or facultyId
            const field = e?.keyPattern?.email ? 'email' : e?.keyPattern?.facultyId ? 'facultyId' : 'unique';
            return new Response(JSON.stringify({ ok: false, message: `Duplicate ${field}` }), { status: 409 });
        }
        return new Response(JSON.stringify({ ok: false, message: 'Create failed' }), { status: 500 });
    }
}
