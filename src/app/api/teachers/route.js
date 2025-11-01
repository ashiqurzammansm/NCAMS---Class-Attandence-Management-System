export const runtime = 'nodejs';

import { dbConnect } from '@/lib/db';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { can } from '@/lib/rbac';

export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
    if (!can(user.role, 'users:manage_teachers')) {
        return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403 });
    }

    await dbConnect();
    const teachers = await User.find({ role: 'teacher' }).select('_id name email role').sort({ name: 1 }).lean();
    return new Response(JSON.stringify(teachers), { status: 200 });
}
