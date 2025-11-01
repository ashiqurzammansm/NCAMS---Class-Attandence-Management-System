export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { getUserFromRequest } from '@/lib/auth';
import { can } from '@/lib/rbac';

export async function POST(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (!can(user.role, 'users:create_teacher')) {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    await dbConnect();

    const body = await request.json().catch(() => ({}));
    const { name, email, password } = body || {};
    if (!name || !email || !password) {
        return new Response(JSON.stringify({ message: 'name, email, password required' }), { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const doc = await User.findOneAndUpdate(
        { email },
        { name, role: 'teacher', passwordHash },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return new Response(JSON.stringify({ ok: true, user: { id: String(doc._id), name: doc.name, email: doc.email, role: doc.role } }), { status: 200 });
}
